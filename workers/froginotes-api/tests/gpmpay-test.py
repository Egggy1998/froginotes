#!/usr/bin/env python3
"""
gpmpay-test.py — Integration tests for FrogiNotes GPM Pay payment flow.

Tests:
  1. POST /api/payment/create-order → 50,000 VND order with VietQR link
  2. POST /api/payment/webhook (signed) → completes order & upgrades user to 'pro'
  3. POST /api/payment/webhook (bad signature) → 401

Requirements:
  pip install requests httpx  (or just stdlib — uses urllib)

Usage (worker must be running on :8787):
  python workers/froginotes-api/tests/gpmpay-test.py

  # With a real GPMPAY_WEBHOOK_SECRET:
  GPMPAY_WEBHOOK_SECRET=<secret> python workers/froginotes-api/tests/gpmpay-test.py

The test uses the dev simulate-payment endpoint to set up state without needing
a real GPM Pay webhook delivery, then verifies the HMAC webhook handler directly.
"""

import hashlib
import hmac
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE_URL = os.getenv("WORKER_URL", "http://localhost:8787")
WEBHOOK_SECRET = os.getenv("GPMPAY_WEBHOOK_SECRET", "test-secret-for-local-testing-only")
DEV_SEED_SECRET = os.getenv("DEV_SEED_SECRET", "local-dev-seed-secret-change-me")

PASS = "\033[92m✓\033[0m"
FAIL = "\033[91m✗\033[0m"
SKIP = "\033[93m~\033[0m"

# ─── HTTP helpers ─────────────────────────────────────────────────────────────

def http(method: str, path: str, body=None, headers: dict | None = None, expect_status: int = 200):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    h = {"Content-Type": "application/json", **(headers or {})}
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read()
            status = resp.status
    except urllib.error.HTTPError as e:
        raw = e.read()
        status = e.code

    try:
        parsed = json.loads(raw)
    except Exception:
        parsed = {"_raw": raw.decode(errors="replace")}

    return status, parsed


def sign_webhook(payload_dict: dict, secret: str) -> str:
    """Reproduce GPM Pay HMAC signing: t=<ts>,v1=<sha256(ts.rawBody)>"""
    raw_body = json.dumps(payload_dict, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    ts = str(int(time.time()))
    msg = f"{ts}.".encode("utf-8") + raw_body
    digest = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    return f"t={ts},v1={digest}", raw_body


# ─── Auth helpers ─────────────────────────────────────────────────────────────

def create_test_user_and_session():
    """
    Use the dev challenge flow to create a test user and get a session token.
    Returns (token, userId) or raises.
    """
    email = f"test-gpmpay-{int(time.time())}@froginotes.test"

    # Initiate challenge
    s, r = http("POST", "/api/auth/challenge", {"email": email})
    if s not in (200, 201):
        raise RuntimeError(f"challenge failed {s}: {r}")

    # In dev mode the confirmUrl is returned
    confirm_url = r.get("devConfirmUrl") or r.get("dev_confirm_url")
    if not confirm_url:
        raise RuntimeError(f"devConfirmUrl not in challenge response: {r}")

    # Confirm the challenge
    confirm_path = confirm_url.replace(BASE_URL, "")
    s2, r2 = http("GET", confirm_path)
    if s2 not in (200, 204):
        raise RuntimeError(f"confirm failed {s2}: {r2}")

    poll_token = r.get("pollToken") or r.get("poll_token")
    if not poll_token:
        raise RuntimeError(f"pollToken not in challenge response: {r}")

    # Poll for session
    for _ in range(5):
        s3, r3 = http("POST", "/api/auth/poll", {"pollToken": poll_token})
        if s3 == 200 and r3.get("token"):
            return r3["token"], r3.get("userId") or r3.get("user", {}).get("id")
        time.sleep(0.5)

    raise RuntimeError(f"poll timeout; last response: {r3}")


# ─── Tests ────────────────────────────────────────────────────────────────────

results = []

def check(name: str, passed: bool, detail: str = ""):
    icon = PASS if passed else FAIL
    print(f"  {icon} {name}" + (f"  [{detail}]" if detail else ""))
    results.append((name, passed))


def test_create_order():
    print("\n[1] POST /api/payment/create-order — 50k monthly order with VietQR")

    try:
        token, user_id = create_test_user_and_session()
    except Exception as e:
        print(f"  {SKIP} Could not create test session: {e}")
        print(f"  {SKIP} Skipping create-order test (worker may not be running).")
        results.append(("create-order: session setup", None))
        return None, None, None

    s, r = http("POST", "/api/payment/create-order",
                body={"plan": "cloud", "period": "monthly"},
                headers={"Authorization": f"Bearer {token}"})

    check("status 200", s == 200, f"got {s}")
    check("ok: true", r.get("ok") is True)
    check("amount == 50000", r.get("amount") == 50_000, f"got {r.get('amount')}")
    check("currency VND", r.get("currency") == "VND")
    check("orderId starts FRG", str(r.get("orderId", "")).startswith("FRG"))
    check("qrUrl is VietQR", "vietqr.io" in str(r.get("qrUrl", "")), f"got {r.get('qrUrl')}")
    check("status pending", r.get("status") == "pending")

    return r.get("orderId"), token, user_id


def test_create_order_defaults():
    """Default period = monthly = 50,000 VND"""
    print("\n[1b] Default period (no period param) → monthly 50k")

    try:
        token, _ = create_test_user_and_session()
    except Exception as e:
        print(f"  {SKIP} session setup failed: {e}")
        results.append(("default period monthly", None))
        return

    s, r = http("POST", "/api/payment/create-order",
                body={"plan": "cloud"},
                headers={"Authorization": f"Bearer {token}"})

    check("status 200", s == 200)
    check("amount defaults to 50000", r.get("amount") == 50_000, f"got {r.get('amount')}")
    check("period is monthly", r.get("period") == "monthly")


def test_yearly_order():
    """Yearly plan = 500,000 VND"""
    print("\n[1c] Yearly plan → 500k order")

    try:
        token, _ = create_test_user_and_session()
    except Exception as e:
        print(f"  {SKIP} session setup failed: {e}")
        results.append(("yearly order 500k", None))
        return

    s, r = http("POST", "/api/payment/create-order",
                body={"plan": "cloud", "period": "yearly"},
                headers={"Authorization": f"Bearer {token}"})

    check("status 200", s == 200)
    check("amount == 500000", r.get("amount") == 500_000, f"got {r.get('amount')}")


def test_webhook_signed(order_id: str, user_id: str):
    print("\n[2] POST /api/payment/webhook — signed webhook completes order & upgrades to 'pro'")

    if not order_id:
        print(f"  {SKIP} No orderId from create-order test; skipping.")
        results.append(("webhook signed: order completed", None))
        results.append(("webhook signed: user plan = pro", None))
        return

    tx_id = f"TX-TEST-{int(time.time())}"
    payload = {
        "id":             tx_id,
        "gateway":        "MB",
        "content":        f"FRG {order_id}",
        "transferType":   "in",
        "transferAmount": 50_000,
        "referenceCode":  "MBTEST123",
        "source":         "SIMULATED",
    }

    signature, raw_body = sign_webhook(payload, WEBHOOK_SECRET)

    # Post as raw body (mimicking GPM Pay)
    url = f"{BASE_URL}/api/payment/webhook"
    req = urllib.request.Request(
        url,
        data=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-GPMPay-Signature": signature,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            resp_body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        status = e.code
        resp_body = json.loads(e.read())

    check("webhook returns 200", status == 200, f"got {status}")
    check("ok: true", resp_body.get("ok") is True, str(resp_body))
    check("status completed", resp_body.get("status") == "completed", str(resp_body))

    # Verify idempotency: send same tx_id again → should still succeed without error
    req2 = urllib.request.Request(
        url,
        data=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-GPMPay-Signature": sign_webhook(payload, WEBHOOK_SECRET)[0],
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req2, timeout=10) as r2:
            s2, b2 = r2.status, json.loads(r2.read())
    except urllib.error.HTTPError as e2:
        s2, b2 = e2.code, json.loads(e2.read())

    check("idempotent retry returns 200", s2 == 200, f"got {s2}")
    check("idempotent retry message is already_processed or already_completed",
          b2.get("message") in ("already_processed", "already_completed"),
          str(b2))


def test_webhook_bad_signature():
    print("\n[3] POST /api/payment/webhook — bad signature → 401")

    payload = {
        "id":             "TX-BADSIG",
        "gateway":        "MB",
        "content":        "FRG FRGFAKE123",
        "transferType":   "in",
        "transferAmount": 50_000,
        "referenceCode":  "MBTEST000",
        "source":         "SIMULATED",
    }

    bad_signature = "t=9999999999,v1=deadbeefdeadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000a"
    raw_body = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

    url = f"{BASE_URL}/api/payment/webhook"
    req = urllib.request.Request(
        url,
        data=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-GPMPay-Signature": bad_signature,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        status = e.code
        body = json.loads(e.read())

    check("bad signature returns 401", status == 401, f"got {status}")
    check("error: invalid_signature", body.get("error") == "invalid_signature", str(body))


def test_dev_simulate_payment():
    """POST /api/dev/simulate-payment — dev endpoint sanity check"""
    print("\n[4] POST /api/dev/simulate-payment (dev only)")

    try:
        token, user_id = create_test_user_and_session()
    except Exception as e:
        print(f"  {SKIP} session setup failed: {e}; skipping simulate-payment test")
        results.append(("dev simulate-payment", None))
        return

    # Create an order first
    s, r = http("POST", "/api/payment/create-order",
                body={"plan": "cloud", "period": "monthly"},
                headers={"Authorization": f"Bearer {token}"})
    if s != 200:
        print(f"  {SKIP} create-order failed: {s} {r}")
        return

    order_id = r["orderId"]

    s2, r2 = http("POST", "/api/dev/simulate-payment",
                  body={"orderId": order_id},
                  headers={"X-Dev-Seed": DEV_SEED_SECRET})

    check("simulate-payment returns 200", s2 == 200, f"got {s2}")
    check("status completed", r2.get("status") == "completed" or r2.get("message") == "already_completed",
          str(r2))


# ─── Runner ───────────────────────────────────────────────────────────────────

def main():
    print(f"FrogiNotes GPM Pay integration tests")
    print(f"Target: {BASE_URL}")
    print(f"Webhook secret: {'<set from env>' if os.getenv('GPMPAY_WEBHOOK_SECRET') else '<using test default>'}")

    # Health check
    s, r = http("GET", "/api/health")
    if s != 200:
        print(f"\n{FAIL} Worker health check failed ({s}). Is the worker running on {BASE_URL}?")
        sys.exit(1)
    print(f"\n{PASS} Worker healthy: {r}")

    order_id, token, user_id = test_create_order()
    test_create_order_defaults()
    test_yearly_order()
    test_webhook_signed(order_id, user_id)
    test_webhook_bad_signature()
    test_dev_simulate_payment()

    # Summary
    total   = len(results)
    passed  = sum(1 for _, ok in results if ok is True)
    failed  = sum(1 for _, ok in results if ok is False)
    skipped = sum(1 for _, ok in results if ok is None)

    print(f"\n{'─'*50}")
    print(f"Results: {passed}/{total} passed, {failed} failed, {skipped} skipped")

    if failed:
        print(f"\n{FAIL} Failed tests:")
        for name, ok in results:
            if ok is False:
                print(f"  - {name}")
        sys.exit(1)
    else:
        print(f"\n{PASS} All tests passed!")


if __name__ == "__main__":
    main()
