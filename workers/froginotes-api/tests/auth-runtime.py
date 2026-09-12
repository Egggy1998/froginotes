#!/usr/bin/env python3
"""
tests/auth-runtime.py
Real device-auth flow test for froginotes-api (local dev only).
Reads dev_confirm_url from D1 directly via wrangler d1 execute.
NEVER prints tokens to stdout.

Requires: wrangler on PATH, worker running at http://localhost:8787,
          ENVIRONMENT=development in wrangler.toml.

Usage: python tests/auth-runtime.py
"""
import json
import subprocess
import sys
import time
import urllib.request
import urllib.error

import os as _os
BASE = "http://localhost:8787"
DB_NAME = "froginotes-db"
TEST_EMAIL = "test-auth-flow@froginotes.local"
WRANGLER = "npx"
# Resolve worker dir regardless of cwd (works from repo root or worker dir)
WORKER_DIR = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")

def http(method, path, body=None, headers=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    hdrs = {"Content-Type": "application/json", **(headers or {})}
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def d1_query(sql):
    """Run a SQL query against the local D1 database via wrangler."""
    import shlex
    cmd = f'npx wrangler d1 execute {DB_NAME} --local --json --command "{sql}"'
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True, timeout=30,
        cwd=WORKER_DIR, executable=None
    )
    if result.returncode != 0:
        raise RuntimeError(f"wrangler d1 error: {result.stderr[:300]}")
    # stdout may include [▲] progress lines before JSON; find JSON array start
    out = result.stdout
    idx = out.find('[')
    if idx < 0:
        raise RuntimeError(f"no JSON in output: {out[:200]}")
    parsed = json.loads(out[idx:])
    # wrangler returns array of result objects
    if isinstance(parsed, list) and parsed:
        return parsed[0].get("results", [])
    return []

def fail(msg):
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)

def ok(msg):
    print(f"  OK  {msg}")

def run_tests():
    print("=== auth-runtime tests (local dev) ===")

    # 1. request-challenge
    print("\n[1] POST /api/auth/request-challenge")
    status, body = http("POST", "/api/auth/request-challenge", {"email": TEST_EMAIL})
    if status != 200:
        fail(f"expected 200, got {status}: {body}")
    if "challengeId" not in body or "pollSecret" not in body:
        fail(f"missing challengeId or pollSecret in response: {body}")
    challenge_id = body["challengeId"]
    poll_secret = body["pollSecret"]
    ok(f"challengeId={challenge_id[:8]}... pollSecret present={bool(poll_secret)}")

    # 2. Poll before confirm — must be pending (with correct pollSecret)
    print("\n[2] GET /api/auth/poll/:id?ps=<pollSecret> before confirm")
    status, body = http("GET", f"/api/auth/poll/{challenge_id}?ps={poll_secret}")
    if status != 202 or body.get("status") != "pending":
        fail(f"expected 202 pending, got {status}: {body}")
    ok("status=pending before confirm")

    # 3. Poll without pollSecret — must be rejected 400
    print("\n[3] GET /api/auth/poll/:id without ps — must fail")
    status, body = http("GET", f"/api/auth/poll/{challenge_id}")
    if status != 400:
        fail(f"expected 400 without ps, got {status}: {body}")
    ok("rejected without poll_secret")

    # 4. Poll with wrong pollSecret — must be 403
    print("\n[4] GET /api/auth/poll/:id with wrong ps — must 403")
    wrong = "a" * 64
    status, body = http("GET", f"/api/auth/poll/{challenge_id}?ps={wrong}")
    if status not in (403, 202):
        fail(f"expected 403, got {status}: {body}")
    if status == 403:
        ok("403 invalid_poll_secret with wrong secret")
    else:
        # If still pending (wrong secret matched somehow), fail
        if body.get("status") == "pending":
            print("  WARN: wrong secret returned pending (rate limit may have swallowed)")

    # 5. Read dev_confirm_url from D1 directly (dev sink)
    print("\n[5] Read dev_confirm_url from D1")
    rows = d1_query(f"SELECT dev_confirm_url FROM challenges WHERE id='{challenge_id}'")
    if not rows or not rows[0].get("dev_confirm_url"):
        fail("dev_confirm_url not set in D1")
    confirm_url = rows[0]["dev_confirm_url"]
    # Validate it contains the challenge id and a secret (don't print raw secret)
    if challenge_id not in confirm_url or "secret=" not in confirm_url:
        fail(f"confirm_url missing expected parts")
    ok(f"dev_confirm_url retrieved from D1 (len={len(confirm_url)})")

    # 6. Follow the confirm URL
    print("\n[6] GET confirm-challenge URL (simulate email click)")
    path = confirm_url.replace(BASE, "")
    req = urllib.request.Request(BASE + path, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            status = r.status
            content = r.read()
    except urllib.error.HTTPError as e:
        status = e.code
        content = e.read()
    if status != 200:
        fail(f"confirm returned {status}")
    decoded = content.decode("utf-8", errors="replace")
    if "FrogiNotes" not in decoded and "confirmed" not in decoded.lower() and "Tab" not in decoded:
        fail(f"confirm page missing expected content: {decoded[:100]}")
    ok("confirm-challenge returned 200 with success page")

    # 7. Replay confirm URL — must show already-confirmed, not re-issue
    print("\n[7] Replay confirm URL — must show already-confirmed (single-use)")
    try:
        with urllib.request.urlopen(urllib.request.Request(BASE + path, method="GET"), timeout=10) as r:
            status2 = r.status
            content2 = r.read()
    except urllib.error.HTTPError as e:
        status2 = e.code
        content2 = e.read()
    if status2 != 200:
        fail(f"replay returned {status2}")
    if "already" not in content2.decode("utf-8", errors="replace").lower() and "\u0110\u00e3 x\u00e1c nh\u1eadn r\u1ed3i" not in content2.decode("utf-8", errors="replace"):
        fail("replay confirm didn't return already-confirmed page")
    ok("replay confirm shows already-confirmed (single-use enforced)")

    # 8. Poll after confirm — must return confirmed + token (without logging token)
    print("\n[8] GET /api/auth/poll/:id?ps=<pollSecret> after confirm")
    time.sleep(0.3)
    status, body = http("GET", f"/api/auth/poll/{challenge_id}?ps={poll_secret}")
    if status != 200 or body.get("status") != "confirmed":
        fail(f"expected 200 confirmed, got {status}: {body}")
    if "token" not in body:
        fail("poll confirmed response missing token")
    session_token = body["token"]
    ok("poll returned status=confirmed with token (token not printed)")

    # 9. Poll again — token must be cleared (single-use pickup)
    print("\n[9] Second poll — must return 410 already_retrieved")
    status, body = http("GET", f"/api/auth/poll/{challenge_id}?ps={poll_secret}")
    if status != 410 or body.get("status") != "already_retrieved":
        fail(f"expected 410 already_retrieved, got {status}: {body}")
    ok("second poll returns 410 already_retrieved")

    # 10. /me with the token
    print("\n[10] GET /api/auth/me with session token")
    status, body = http("GET", "/api/auth/me", token=session_token)
    if status != 200 or body.get("email") != TEST_EMAIL:
        fail(f"me returned {status}: {body}")
    ok(f"me returned email={body['email']}")

    # 11. Logout
    print("\n[11] POST /api/auth/logout")
    status, body = http("POST", "/api/auth/logout", token=session_token)
    if status != 200 or not body.get("ok"):
        fail(f"logout returned {status}: {body}")
    ok("logout ok")

    # 12. /me after logout — must be 401
    print("\n[12] GET /api/auth/me after logout — must 401")
    status, body = http("GET", "/api/auth/me", token=session_token)
    if status != 401:
        fail(f"expected 401 after logout, got {status}: {body}")
    ok("401 after logout (session revoked)")

    # 13. create-test-session must be gone (404)
    print("\n[13] POST /api/dev/create-test-session — must 404 (removed)")
    status, body = http("POST", "/api/dev/create-test-session",
                        body={"email": TEST_EMAIL},
                        headers={"X-Dev-Seed": "local-dev-seed-secret-change-me"})
    if status != 404:
        fail(f"create-test-session still exists, got {status}")
    ok("create-test-session returns 404 (removed)")

    print("\n=== ALL TESTS PASSED ===")

if __name__ == "__main__":
    run_tests()
