#!/usr/bin/env python3
"""
tests/payment-gating.py
Payment gating integration tests for froginotes-api (local dev).

Tests:
  1. Free user calling GET /api/notes returns 403 plan_required.
  2. Free user calling POST /api/notes/batch returns 403 plan_required.
  3. Free user calling GET /api/diary returns 403 plan_required.
  4. Free user calling POST /api/diary/batch returns 403 plan_required.
  5. POST /api/payment/create-order returns valid order (pending).
  6. GET /api/payment/order/:id returns status='pending'.
  7. POST /api/dev/simulate-payment completes the order.
  8. GET /api/payment/order/:id now returns status='completed'.
  9. GET /api/auth/me now shows plan='pro'.
 10. Pro user calling GET /api/notes returns 200.
 11. Pro user calling POST /api/notes/batch returns 200.
 12. Pro user calling GET /api/diary returns 200.
 13. Pro user calling POST /api/diary/batch returns 200.
 14. Unauthenticated create-order returns 401.
 15. create-order with invalid plan returns 400.
 16. GET order with wrong user returns 403.
 17. POST /api/payment/webhook with transfer description resolves order.

Requires: wrangler on PATH, worker running at http://localhost:8787,
          ENVIRONMENT=development in wrangler.toml.
Usage: python tests/payment-gating.py
"""

import json
import subprocess
import sys
import time
import uuid
import urllib.request
import urllib.error

BASE = "http://localhost:8787"
DB_NAME = "froginotes-db"
WRANGLER_DIR = "D:/Dự án làm việc/sticky note/workers/froginotes-api"

RUN_ID = uuid.uuid4().hex[:8]
FREE_USER_EMAIL = f"pay-free-{RUN_ID}@froginotes.local"
SECONDARY_EMAIL = f"pay-sec-{RUN_ID}@froginotes.local"

PASS_COUNT = 0
FAIL_COUNT = 0
FAILURES = []


def http(method, path, body=None, headers=None, token=None, timeout=10):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    hdrs = {"Content-Type": "application/json", **(headers or {})}
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}
    except Exception as ex:
        return 0, {"_exception": str(ex)}


def d1_query(sql, timeout=30):
    cmd = f'npx wrangler d1 execute {DB_NAME} --local --json --command "{sql}"'
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True, timeout=timeout,
        cwd=WRANGLER_DIR
    )
    if result.returncode != 0:
        raise RuntimeError(f"wrangler d1 error: {result.stderr[:300]}")
    out = result.stdout
    idx = out.find('[')
    if idx < 0:
        raise RuntimeError(f"no JSON in output: {out[:200]}")
    parsed = json.loads(out[idx:])
    if isinstance(parsed, list) and parsed:
        return parsed[0].get("results", [])
    return []


def check(name, condition, detail=""):
    global PASS_COUNT, FAIL_COUNT
    if condition:
        PASS_COUNT += 1
        print(f"  PASS  {name}")
    else:
        FAIL_COUNT += 1
        msg = f"  FAIL  {name}" + (f" — {detail}" if detail else "")
        print(msg)
        FAILURES.append(msg)


def do_auth(email):
    # Ensure rate limits don't block test registration
    try:
        d1_query("DELETE FROM rate_limits WHERE key LIKE 'challenge:%'")
    except Exception:
        pass
    status, body = http("POST", "/api/auth/request-challenge", {"email": email})
    if status == 429:
        try:
            d1_query("DELETE FROM rate_limits WHERE key LIKE 'challenge:%'")
            status, body = http("POST", "/api/auth/request-challenge", {"email": email})
        except Exception:
            pass
    if status != 200 or "challengeId" not in body:
        raise RuntimeError(f"request-challenge failed: {status} {body}")

    challenge_id = body["challengeId"]
    poll_secret = body["pollSecret"]

    time.sleep(0.3)
    rows = d1_query(f"SELECT dev_confirm_url FROM challenges WHERE id='{challenge_id}' LIMIT 1")
    if not rows or not rows[0].get("dev_confirm_url"):
        raise RuntimeError(f"dev_confirm_url not found for challenge {challenge_id}")

    confirm_url = rows[0]["dev_confirm_url"]
    confirm_req = urllib.request.Request(confirm_url, method="GET")
    try:
        with urllib.request.urlopen(confirm_req, timeout=10) as r:
            if r.status != 200:
                raise RuntimeError(f"confirm returned {r.status}")
    except urllib.error.HTTPError as e:
        if e.code != 200:
            raise RuntimeError(f"confirm returned {e.code}")

    token = None
    for _ in range(20):
        time.sleep(0.5)
        s, b = http("GET", f"/api/auth/poll/{challenge_id}?ps={poll_secret}")
        if s == 200 and b.get("status") == "confirmed":
            token = b.get("token")
            break
        if s == 202:
            continue
        raise RuntimeError(f"poll unexpected: {s} {b}")

    if not token:
        raise RuntimeError("poll never returned token")
    return token


def note_id():
    return f"pg-{RUN_ID}-{uuid.uuid4().hex[:8]}"


def diary_id():
    return f"pgd-{RUN_ID}-{uuid.uuid4().hex[:8]}"


def run_tests():
    print(f"\n=== payment-gating tests (run_id={RUN_ID}) ===\n")

    # ── Auth: register free user ─────────────────────────────────────────────
    print("[SETUP] Registering free user...")
    try:
        free_token = do_auth(FREE_USER_EMAIL)
        print(f"  Free user auth OK ({FREE_USER_EMAIL[:40]})")
    except Exception as e:
        print(f"  FATAL: free user auth failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("[SETUP] Registering secondary user...")
    try:
        sec_token = do_auth(SECONDARY_EMAIL)
        print(f"  Secondary user auth OK")
    except Exception as e:
        print(f"  FATAL: secondary user auth failed: {e}", file=sys.stderr)
        sys.exit(1)

    print()

    # ── 1-4: Free user blocked by plan gate ──────────────────────────────────
    print("[PLAN GATE] Free user sync endpoints must return 403 plan_required")

    s, b = http("GET", "/api/notes", token=free_token)
    check("Free user GET /api/notes returns 403", s == 403, f"{s} {b}")
    check("GET /api/notes error=plan_required", b.get("error") == "plan_required", str(b))
    check("GET /api/notes ok=false", b.get("ok") is False, str(b))
    check("GET /api/notes has Vietnamese message", "Pro" in b.get("message", ""), str(b))

    s, b = http("POST", "/api/notes/batch", {"upsert": [], "delete": []}, token=free_token)
    check("Free user POST /api/notes/batch returns 403", s == 403, f"{s} {b}")
    check("POST /api/notes/batch error=plan_required", b.get("error") == "plan_required", str(b))

    s, b = http("GET", "/api/diary", token=free_token)
    check("Free user GET /api/diary returns 403", s == 403, f"{s} {b}")
    check("GET /api/diary error=plan_required", b.get("error") == "plan_required", str(b))

    s, b = http("POST", "/api/diary/batch", {"upsert": [], "delete": []}, token=free_token)
    check("Free user POST /api/diary/batch returns 403", s == 403, f"{s} {b}")
    check("POST /api/diary/batch error=plan_required", b.get("error") == "plan_required", str(b))

    print()

    # ── 5: create-order validation ────────────────────────────────────────────
    print("[PAYMENT] Unauthenticated create-order returns 401")
    s, b = http("POST", "/api/payment/create-order", {"plan": "pro", "period": "yearly"})
    check("Unauthenticated create-order returns 401", s == 401, f"{s} {b}")

    print("[PAYMENT] Invalid plan returns 400")
    s, b = http("POST", "/api/payment/create-order", {"plan": "enterprise", "period": "yearly"}, token=free_token)
    check("Invalid plan returns 400", s == 400, f"{s} {b}")

    s, b = http("POST", "/api/payment/create-order", {"plan": "pro", "period": "invalid_period"}, token=free_token)
    check("Invalid period returns 400", s == 400, f"{s} {b}")

    print()

    # ── 6: create order (monthly - 50k) ──────────────────────────────────────────
    print("[PAYMENT] Create order pro/monthly (50k)")
    s, b = http("POST", "/api/payment/create-order", {"plan": "pro", "period": "monthly"}, token=free_token)
    check("create-order returns 200", s == 200, f"{s} {b}")
    check("create-order ok=true", b.get("ok") is True, str(b))
    check("create-order has orderId", bool(b.get("orderId")), str(b))
    check("create-order amount=50000", b.get("amount") == 50000, f"amount={b.get('amount')}")
    check("create-order status=pending", b.get("status") == "pending", str(b))
    check("create-order has qrUrl", bool(b.get("qrUrl")), str(b))
    check("create-order qrUrl contains vietqr", "vietqr.io" in b.get("qrUrl", ""), str(b))
    check("create-order has expiresAt", bool(b.get("expiresAt")), str(b))
    check("create-order transferDescription contains FRG", "FRG" in b.get("transferDescription", ""), str(b))

    order_id = b.get("orderId")
    transfer_desc = b.get("transferDescription", "")
    print(f"  orderId: {order_id}")

    print()

    # ── 7: GET order (own) ────────────────────────────────────────────────────
    print("[PAYMENT] GET order/:id for owner")
    s, b = http("GET", f"/api/payment/order/{order_id}", token=free_token)
    check("GET order returns 200", s == 200, f"{s} {b}")
    check("GET order status=pending", b.get("status") == "pending", str(b))
    check("GET order orderId matches", b.get("orderId") == order_id, str(b))

    print("[PAYMENT] GET order from wrong user returns 403")
    s, b = http("GET", f"/api/payment/order/{order_id}", token=sec_token)
    check("GET order wrong user returns 403", s == 403, f"{s} {b}")

    print("[PAYMENT] GET non-existent order returns 404")
    s, b = http("GET", "/api/payment/order/FRG-NOTEXIST", token=free_token)
    check("GET non-existent order returns 404", s == 404, f"{s} {b}")

    print()

    # ── 8: Dev simulate-payment ───────────────────────────────────────────────
    print("[PAYMENT] POST /api/dev/simulate-payment completes the order")
    s, b = http("POST", "/api/dev/simulate-payment", {"orderId": order_id})
    check("simulate-payment returns 200", s == 200, f"{s} {b}")
    check("simulate-payment ok=true", b.get("ok") is True, str(b))
    check("simulate-payment status=completed", b.get("status") == "completed", str(b))
    check("simulate-payment plan=pro", b.get("plan") == "pro", str(b))

    print()

    # ── 9: GET order now completed ────────────────────────────────────────────
    print("[PAYMENT] GET order now shows completed")
    s, b = http("GET", f"/api/payment/order/{order_id}", token=free_token)
    check("GET order after payment status=completed", b.get("status") == "completed", f"{s} {b}")
    check("GET order completedAt set", bool(b.get("completedAt")), str(b))

    print()

    # ── 10: /me now shows pro ────────────────────────────────────────────────
    print("[PAYMENT] /api/auth/me shows plan=pro after upgrade")
    s, b = http("GET", "/api/auth/me", token=free_token)
    check("/me returns 200", s == 200, f"{s} {b}")
    check("/me plan=pro after upgrade", b.get("plan") == "pro", f"plan={b.get('plan')}")

    print()

    # ── 11-14: Pro user can now access sync endpoints ────────────────────────
    print("[PLAN GATE] Pro user sync endpoints must return 200")
    s, b = http("GET", "/api/notes", token=free_token)
    check("Pro user GET /api/notes returns 200", s == 200, f"{s} {b}")
    check("GET /api/notes has notes key", "notes" in b, str(b))

    nid = note_id()
    s, b = http("POST", "/api/notes/batch", {
        "upsert": [{
            "id": nid, "expectedRevision": 0, "title": "Pro note",
            "createdAt": "2026-09-11T10:00:00.000Z", "updatedAt": "2026-09-11T10:00:00.000Z"
        }]
    }, token=free_token)
    check("Pro user POST /api/notes/batch returns 200", s == 200, f"{s} {b}")
    check("notes batch ok=true", b.get("ok") is True, str(b))
    check("note upserted", nid in b.get("applied", {}).get("upserted", []), str(b))

    s, b = http("GET", "/api/diary", token=free_token)
    check("Pro user GET /api/diary returns 200", s == 200, f"{s} {b}")
    check("GET /api/diary has entries key", "entries" in b, str(b))

    did = diary_id()
    s, b = http("POST", "/api/diary/batch", {
        "upsert": [{
            "id": did, "expectedRevision": 0, "date": "2026-09-11",
            "mood": "happy", "content": "Pro diary entry",
            "createdAt": "2026-09-11T10:00:00.000Z", "updatedAt": "2026-09-11T10:00:00.000Z"
        }]
    }, token=free_token)
    check("Pro user POST /api/diary/batch returns 200", s == 200, f"{s} {b}")
    check("diary batch ok=true", b.get("ok") is True, str(b))
    check("diary entry upserted", did in b.get("applied", {}).get("upserted", []), str(b))

    print()

    # ── 15: webhook route (transfer description match) ────────────────────────
    print("[PAYMENT] Webhook via transfer description")
    # Create a fresh order for the secondary user to test webhook (monthly 50k)
    s, b = http("POST", "/api/payment/create-order", {"plan": "pro", "period": "monthly"}, token=sec_token)
    check("Secondary user create-order returns 200", s == 200, f"{s} {b}")
    check("Monthly amount=50000", b.get("amount") == 50000, f"amount={b.get('amount')}")

    sec_order_id = b.get("orderId", "")
    sec_transfer_desc = b.get("transferDescription", f"FRG {sec_order_id}")

    # Webhook with transfer description
    s, b = http("POST", "/api/payment/webhook", {
        "id": f"tx_gpm_{RUN_ID}",
        "transferType": "in",
        "transferAmount": 50000,
        "content": sec_transfer_desc,
    })
    check("Webhook via transferDescription returns 200", s == 200, f"{s} {b}")
    check("Webhook ok=true", b.get("ok") is True, str(b))
    check("Webhook status=completed", b.get("status") == "completed", str(b))

    # Verify secondary user now has pro plan
    s, b = http("GET", "/api/auth/me", token=sec_token)
    check("Secondary user /me plan=pro after webhook", b.get("plan") == "pro", f"plan={b.get('plan')}")

    print()

    # ── Summary ───────────────────────────────────────────────────────────────
    total = PASS_COUNT + FAIL_COUNT
    print("=" * 55)
    print(f"RESULTS: {PASS_COUNT}/{total} passed, {FAIL_COUNT} failed")
    if FAILURES:
        print("\nFAILURES:")
        for f in FAILURES:
            print(f"  {f}")
    print("=" * 55)
    return FAIL_COUNT == 0


if __name__ == "__main__":
    passed = run_tests()
    sys.exit(0 if passed else 1)
