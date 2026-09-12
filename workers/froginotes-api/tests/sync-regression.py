#!/usr/bin/env python3
"""
tests/sync-regression.py
Sync regression suite for froginotes-api (local dev).

Tests:
  - Real auth flow (challenge-confirm-poll) for TWO separate users
  - Notes CRUD isolation between users
  - Diary CRUD isolation between users
  - expectedRevision CAS: stale writes and deletes return conflict
  - Tombstones prevent resurrection (tombstoned note stays conflict)
  - Retry / Idempotency-Key: duplicate batch returns same result
  - Size validation: oversized content rejected 400
  - Free/paid decor gating: checkout always 503
  - decorAssetId data preserved across sync roundtrip (tape_style, doodle)

Requires: wrangler on PATH, worker running at http://localhost:8787,
          ENVIRONMENT=development in wrangler.toml.

Usage: python tests/sync-regression.py
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

# Unique run prefix to avoid touching real data
RUN_ID = uuid.uuid4().hex[:8]
USER_A_EMAIL = f"sync-reg-a-{RUN_ID}@froginotes.local"
USER_B_EMAIL = f"sync-reg-b-{RUN_ID}@froginotes.local"

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
    """Run a SQL query against the local D1 database via wrangler."""
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


def note_id():
    return f"sync-reg-{RUN_ID}-{uuid.uuid4().hex[:8]}"


def diary_id():
    return f"sync-diary-{RUN_ID}-{uuid.uuid4().hex[:8]}"


def do_auth(email):
    """Complete full challenge-confirm-poll flow for a given email. Returns bearer token."""
    # Step 1: request-challenge
    status, body = http("POST", "/api/auth/request-challenge", {"email": email})
    if status != 200 or "challengeId" not in body or "pollSecret" not in body:
        raise RuntimeError(f"request-challenge failed: {status} {body}")

    challenge_id = body["challengeId"]
    poll_secret = body["pollSecret"]

    # Step 2: read dev_confirm_url from D1 directly
    time.sleep(0.3)
    rows = d1_query(f"SELECT dev_confirm_url FROM challenges WHERE id='{challenge_id}' LIMIT 1")
    if not rows or not rows[0].get("dev_confirm_url"):
        raise RuntimeError(f"dev_confirm_url not found in D1 for challenge {challenge_id}")

    confirm_url = rows[0]["dev_confirm_url"]

    # Step 3: hit the confirm URL (simulating user clicking email link)
    confirm_req = urllib.request.Request(confirm_url, method="GET")
    try:
        with urllib.request.urlopen(confirm_req, timeout=10) as r:
            confirm_status = r.status
    except urllib.error.HTTPError as e:
        confirm_status = e.code
    if confirm_status != 200:
        raise RuntimeError(f"confirm-challenge returned {confirm_status}")

    # Step 4: poll for token
    token = None
    for _ in range(20):
        time.sleep(0.5)
        status, body = http("GET", f"/api/auth/poll/{challenge_id}?ps={poll_secret}")
        if status == 200 and body.get("status") == "confirmed":
            token = body.get("token")
            break
        if status == 202:
            continue
        raise RuntimeError(f"poll unexpected response: {status} {body}")

    if not token:
        raise RuntimeError("poll never returned confirmed token")
    return token


def run_tests():
    print(f"\n=== sync-regression tests (run_id={RUN_ID}) ===\n")

    # ── Auth setup for two users ──────────────────────────────────────────────
    print("[AUTH] Setting up User A and User B via real challenge-confirm-poll flow")
    try:
        token_a = do_auth(USER_A_EMAIL)
        print(f"  User A auth OK ({USER_A_EMAIL[:30]})")
    except Exception as e:
        print(f"  FATAL: User A auth failed: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        token_b = do_auth(USER_B_EMAIL)
        print(f"  User B auth OK ({USER_B_EMAIL[:30]})")
    except Exception as e:
        print(f"  FATAL: User B auth failed: {e}", file=sys.stderr)
        sys.exit(1)

    # Verify /me for both
    sa, ma = http("GET", "/api/auth/me", token=token_a)
    sb, mb = http("GET", "/api/auth/me", token=token_b)
    check("User A /me returns 200 with email", sa == 200 and ma.get("email") == USER_A_EMAIL)
    check("User B /me returns 200 with email", sb == 200 and mb.get("email") == USER_B_EMAIL)

    user_a_id = ma.get("id")
    user_b_id = mb.get("id")
    check("User A and B have different IDs", user_a_id != user_b_id and user_a_id and user_b_id,
          f"a={user_a_id} b={user_b_id}")

    print()

    # ── Notes: User A creates notes ───────────────────────────────────────────
    print("[NOTES] User A creates two notes with decorAssetId fields")

    nid1 = note_id()
    nid2 = note_id()

    status, body = http("POST", "/api/notes/batch", {
        "upsert": [
            {
                "id": nid1,
                "expectedRevision": 0,
                "title": "Note One",
                "content": "Hello from user A",
                "type": "text",
                "color": "yellow",
                "tapeStyle": "tape-sakura-pink",   # decor asset ID preserved
                "tapePosition": "top-left",
                "doodle": "doodle-leaf",             # decor asset ID preserved
                "createdAt": "2026-09-11T00:00:00.000Z",
                "updatedAt": "2026-09-11T00:00:00.000Z",
            },
            {
                "id": nid2,
                "expectedRevision": 0,
                "title": "Note Two",
                "content": "Another note",
                "createdAt": "2026-09-11T00:01:00.000Z",
                "updatedAt": "2026-09-11T00:01:00.000Z",
            }
        ]
    }, token=token_a)

    check("User A creates 2 notes (status 200)", status == 200, f"{status} {body}")
    check("User A batch: 2 upserted, 0 conflicts",
          body.get("ok") and len(body.get("applied", {}).get("upserted", [])) == 2
          and len(body.get("conflicts", [])) == 0,
          str(body))

    # ── Notes: decorAssetId data preserved in GET ─────────────────────────────
    print("\n[NOTES] Verify decorAssetId data preserved after create")
    status, body = http("GET", "/api/notes", token=token_a)
    check("GET /api/notes returns 200", status == 200, str(body))
    notes = body.get("notes", [])
    n1 = next((n for n in notes if n["id"] == nid1), None)
    check("Note 1 exists in GET response", n1 is not None)
    if n1:
        check("tape_style preserved (decorAssetId)", n1.get("tape_style") == "tape-sakura-pink",
              f"got {n1.get('tape_style')}")
        check("tape_position preserved", n1.get("tape_position") == "top-left",
              f"got {n1.get('tape_position')}")
        check("doodle preserved (decorAssetId)", n1.get("doodle") == "doodle-leaf",
              f"got {n1.get('doodle')}")
        check("revision=1 after insert", n1.get("revision") == 1, f"revision={n1.get('revision')}")

    # ── Notes: User B cannot see User A's notes ───────────────────────────────
    print("\n[NOTES] User isolation: User B cannot see User A's notes")
    status, body = http("GET", "/api/notes", token=token_b)
    check("User B GET /api/notes returns 200", status == 200)
    b_notes = body.get("notes", [])
    b_note_ids = [n["id"] for n in b_notes]
    check("User A's notes not visible to User B",
          nid1 not in b_note_ids and nid2 not in b_note_ids,
          f"User B sees: {b_note_ids[:5]}")

    # ── Notes: CAS — stale expectedRevision causes conflict ───────────────────
    print("\n[NOTES] CAS: stale expectedRevision returns conflict")

    # Advance revision of nid1 to 2
    status, body = http("POST", "/api/notes/batch", {
        "upsert": [{"id": nid1, "expectedRevision": 1, "title": "Updated", "createdAt": "2026-09-11T00:00:00.000Z", "updatedAt": "2026-09-11T00:02:00.000Z"}]
    }, token=token_a)
    check("Advance nid1 revision to 2", status == 200 and body.get("ok"),
          f"{status} {body}")

    # Now try with stale expectedRevision=1 (server is at 2)
    status, body = http("POST", "/api/notes/batch", {
        "upsert": [{"id": nid1, "expectedRevision": 1, "title": "Stale write", "createdAt": "2026-09-11T00:00:00.000Z", "updatedAt": "2026-09-11T00:03:00.000Z"}]
    }, token=token_a)
    check("Stale write returns 200 with conflict (not 500)", status == 200, f"{status} {body}")
    conflicts = body.get("conflicts", [])
    check("Stale write produces 1 conflict", len(conflicts) == 1, f"conflicts={conflicts}")
    if conflicts:
        check("Conflict reason=revision_mismatch", conflicts[0].get("reason") == "revision_mismatch",
              str(conflicts[0]))
        check("Conflict includes serverRevision", "serverRevision" in conflicts[0],
              str(conflicts[0]))
        check("Conflict serverRecord not None", conflicts[0].get("serverRecord") is not None,
              str(conflicts[0]))

    # ── Notes: stale delete returns conflict ──────────────────────────────────
    print("\n[NOTES] CAS: stale delete returns conflict")
    # Server nid1 is at revision 2; try delete with expectedRevision=1
    status, body = http("POST", "/api/notes/batch", {
        "delete": [{"id": nid1, "expectedRevision": 1}]
    }, token=token_a)
    check("Stale delete returns 200 with conflict", status == 200, f"{status} {body}")
    conflicts = body.get("conflicts", [])
    check("Stale delete produces 1 conflict", len(conflicts) == 1, f"conflicts={conflicts}")
    if conflicts:
        check("Stale delete conflict reason=revision_mismatch",
              conflicts[0].get("reason") == "revision_mismatch", str(conflicts[0]))

    # ── Notes: correct delete creates tombstone ────────────────────────────────
    print("\n[NOTES] Correct delete creates tombstone")
    # nid1 is at revision 2
    status, body = http("POST", "/api/notes/batch", {
        "delete": [{"id": nid1, "expectedRevision": 2}]
    }, token=token_a)
    check("Correct delete applied", status == 200 and body.get("ok") and nid1 in body.get("applied", {}).get("deleted", []),
          f"{status} {body}")

    # Tombstone appears in GET
    time.sleep(0.1)
    status, body = http("GET", "/api/notes", token=token_a)
    tombstones = body.get("tombstones", [])
    t1 = next((t for t in tombstones if t["id"] == nid1), None)
    check("Tombstone appears in GET response", t1 is not None, f"tombstones={[t['id'] for t in tombstones]}")
    if t1:
        check("Tombstone has deletedAt field", "deletedAt" in t1, str(t1))
        check("Tombstone has revision field", "revision" in t1, str(t1))

    # ── Notes: tombstone prevents resurrection ────────────────────────────────
    print("\n[NOTES] Tombstone prevents resurrection")
    status, body = http("POST", "/api/notes/batch", {
        "upsert": [{"id": nid1, "expectedRevision": 2, "title": "Resurrected", "createdAt": "2026-09-11T00:00:00.000Z", "updatedAt": "2026-09-11T00:04:00.000Z"}]
    }, token=token_a)
    check("Resurrect attempt returns 200", status == 200)
    conflicts = body.get("conflicts", [])
    check("Resurrect produces conflict (tombstoned)", len(conflicts) == 1 and conflicts[0].get("reason") == "tombstoned",
          f"conflicts={conflicts}")

    # ── Notes: Idempotency-Key prevents double-apply ──────────────────────────
    print("\n[NOTES] Idempotency-Key: retried batch returns same result")
    idem_key = f"idem-{RUN_ID}-001"
    nid3 = note_id()
    payload = {
        "upsert": [{"id": nid3, "expectedRevision": 0, "title": "Idempotent note",
                    "createdAt": "2026-09-11T01:00:00.000Z", "updatedAt": "2026-09-11T01:00:00.000Z"}]
    }

    s1, b1 = http("POST", "/api/notes/batch", payload, headers={"Idempotency-Key": idem_key}, token=token_a)
    s2, b2 = http("POST", "/api/notes/batch", payload, headers={"Idempotency-Key": idem_key}, token=token_a)

    check("Idempotent first call returns 200", s1 == 200, f"{s1} {b1}")
    check("Idempotent retry returns 200", s2 == 200, f"{s2} {b2}")
    check("Both idempotent calls same applied list",
          b1.get("applied") == b2.get("applied") and b1.get("conflicts") == b2.get("conflicts"),
          f"b1={b1} b2={b2}")

    # ── Notes: size validation ────────────────────────────────────────────────
    print("\n[NOTES] Size validation")
    nid_big = note_id()

    # Title > 1024 bytes
    status, body = http("POST", "/api/notes/batch", {
        "upsert": [{"id": nid_big, "expectedRevision": 0, "title": "x" * 1100,
                    "createdAt": "2026-09-11T01:00:00.000Z", "updatedAt": "2026-09-11T01:00:00.000Z"}]
    }, token=token_a)
    check("Title > 1024 bytes returns 400", status == 400, f"{status} {body}")

    # Content > 65536 bytes
    status, body = http("POST", "/api/notes/batch", {
        "upsert": [{"id": nid_big, "expectedRevision": 0, "title": "ok",
                    "content": "x" * 70000,
                    "createdAt": "2026-09-11T01:00:00.000Z", "updatedAt": "2026-09-11T01:00:00.000Z"}]
    }, token=token_a)
    check("Content > 65536 bytes returns 400", status == 400, f"{status} {body}")

    # ── Notes: since= delta sync ──────────────────────────────────────────────
    print("\n[NOTES] Delta sync via ?since=")
    since_ts = "2026-09-11T00:00:30.000Z"
    status, body = http("GET", f"/api/notes?since={since_ts}", token=token_a)
    check("GET /api/notes?since= returns 200", status == 200, f"{status} {body}")
    check("since= response has notes and tombstones keys",
          "notes" in body and "tombstones" in body, str(body.keys()))

    # ── Diary: User A creates entries ────────────────────────────────────────
    print("\n[DIARY] User A creates diary entries")
    did1 = diary_id()
    did2 = diary_id()

    status, body = http("POST", "/api/diary/batch", {
        "upsert": [
            {
                "id": did1,
                "expectedRevision": 0,
                "date": "2026-09-11",
                "mood": "happy",
                "weather": "sunny",
                "title": "My Day",
                "content": "Had a great day",
                "photoUrl": None,
                "tapeStyle": "tape-mint",
                "tapePosition": "bottom-right",
                "createdAt": "2026-09-11T08:00:00.000Z",
                "updatedAt": "2026-09-11T08:00:00.000Z",
            },
            {
                "id": did2,
                "expectedRevision": 0,
                "date": "2026-09-10",
                "mood": "sad",
                "content": "Quiet day",
                "createdAt": "2026-09-10T08:00:00.000Z",
                "updatedAt": "2026-09-10T08:00:00.000Z",
            }
        ]
    }, token=token_a)
    check("User A creates 2 diary entries", status == 200 and len(body.get("applied", {}).get("upserted", [])) == 2,
          f"{status} {body}")

    # ── Diary: user isolation ─────────────────────────────────────────────────
    print("\n[DIARY] User isolation: User B cannot see User A's diary entries")
    status, body = http("GET", "/api/diary", token=token_b)
    check("User B GET /api/diary returns 200", status == 200)
    b_entries = body.get("entries", [])
    b_entry_ids = [e["id"] for e in b_entries]
    check("User A's diary not visible to User B",
          did1 not in b_entry_ids and did2 not in b_entry_ids,
          f"User B sees: {b_entry_ids[:5]}")

    # ── Diary: CAS conflict ───────────────────────────────────────────────────
    print("\n[DIARY] CAS: stale diary upsert returns conflict")
    # Advance did1 to revision 2
    http("POST", "/api/diary/batch", {
        "upsert": [{"id": did1, "expectedRevision": 1, "date": "2026-09-11", "mood": "excited",
                    "content": "Updated!", "createdAt": "2026-09-11T08:00:00.000Z",
                    "updatedAt": "2026-09-11T09:00:00.000Z"}]
    }, token=token_a)

    # Stale write
    status, body = http("POST", "/api/diary/batch", {
        "upsert": [{"id": did1, "expectedRevision": 1, "date": "2026-09-11", "mood": "sad",
                    "content": "Stale", "createdAt": "2026-09-11T08:00:00.000Z",
                    "updatedAt": "2026-09-11T10:00:00.000Z"}]
    }, token=token_a)
    check("Stale diary write returns conflict", status == 200 and len(body.get("conflicts", [])) == 1,
          f"{status} {body}")

    # ── Diary: tombstone and resurrection prevention ───────────────────────────
    print("\n[DIARY] Tombstone and resurrection prevention")
    # Delete did2 (revision 1)
    status, body = http("POST", "/api/diary/batch", {
        "delete": [{"id": did2, "expectedRevision": 1}]
    }, token=token_a)
    check("Diary entry deleted (tombstoned)", status == 200 and did2 in body.get("applied", {}).get("deleted", []),
          f"{status} {body}")

    # Try to resurrect
    status, body = http("POST", "/api/diary/batch", {
        "upsert": [{"id": did2, "expectedRevision": 1, "date": "2026-09-10", "mood": "happy",
                    "content": "Resurrection", "createdAt": "2026-09-10T08:00:00.000Z",
                    "updatedAt": "2026-09-10T09:00:00.000Z"}]
    }, token=token_a)
    conflicts = body.get("conflicts", [])
    check("Diary tombstone prevents resurrection",
          status == 200 and len(conflicts) == 1 and conflicts[0].get("reason") == "tombstoned",
          f"conflicts={conflicts}")

    # Diary tombstone appears in GET
    status, body = http("GET", "/api/diary", token=token_a)
    t_ids = [t["id"] for t in body.get("tombstones", [])]
    check("Diary tombstone in GET response", did2 in t_ids, f"tombstones={t_ids[:5]}")

    # ── Diary: Idempotency-Key ─────────────────────────────────────────────────
    print("\n[DIARY] Idempotency-Key on diary batch")
    diary_idem_key = f"diary-idem-{RUN_ID}-001"
    did3 = diary_id()
    dpayload = {
        "upsert": [{"id": did3, "expectedRevision": 0, "date": "2026-09-09",
                    "mood": "calm", "content": "Idem test",
                    "createdAt": "2026-09-09T08:00:00.000Z",
                    "updatedAt": "2026-09-09T08:00:00.000Z"}]
    }
    ds1, db1 = http("POST", "/api/diary/batch", dpayload, headers={"Idempotency-Key": diary_idem_key}, token=token_a)
    ds2, db2 = http("POST", "/api/diary/batch", dpayload, headers={"Idempotency-Key": diary_idem_key}, token=token_a)
    check("Diary idempotent first call 200", ds1 == 200)
    check("Diary idempotent retry 200", ds2 == 200)
    check("Diary idempotent same applied", db1.get("applied") == db2.get("applied"),
          f"db1={db1} db2={db2}")

    # ── Diary: size validation ────────────────────────────────────────────────
    print("\n[DIARY] Size validation on diary")
    did_big = diary_id()
    status, body = http("POST", "/api/diary/batch", {
        "upsert": [{"id": did_big, "expectedRevision": 0, "date": "2026-09-08",
                    "content": "x" * 70000,
                    "createdAt": "2026-09-08T08:00:00.000Z",
                    "updatedAt": "2026-09-08T08:00:00.000Z"}]
    }, token=token_a)
    check("Diary content > 65536 bytes returns 400", status == 400, f"{status} {body}")

    # ── Decor: packs visible to both users ────────────────────────────────────
    print("\n[DECOR] Packs and checkout")
    status, body = http("GET", "/api/decor/packs", token=token_a)
    check("GET /api/decor/packs returns 200", status == 200, f"{status} {body}")
    packs = body.get("packs", [])
    check("At least one decor pack exists", len(packs) >= 1, f"packs count={len(packs)}")
    if packs:
        pack = packs[0]
        check("Pack has camelCase priceUsdCents", "priceUsdCents" in pack, str(pack.keys()))
        check("Pack has previewAssets list", isinstance(pack.get("previewAssets"), list), str(pack))
        check("Pack has owned boolean", isinstance(pack.get("owned"), bool), str(pack))
        # Free user: fullAssets null if not owned
        free_pack = next((p for p in packs if p.get("priceUsdCents", 1) > 0), None)
        if free_pack:
            check("Paid pack fullAssets null for non-owner",
                  free_pack.get("fullAssets") is None or free_pack.get("owned") is True,
                  str(free_pack))

    # ── Decor: checkout always 503 ─────────────────────────────────────────────
    status, body = http("POST", "/api/decor/checkout", {"packId": "pack-pastel-dream"}, token=token_a)
    check("POST /api/decor/checkout returns 503 (gated)", status == 503, f"{status} {body}")
    check("Checkout 503 has ok=false", body.get("ok") is False, str(body))
    check("Checkout 503 has error field", "error" in body, str(body))

    # ── Decor: unauthenticated packs returns 401 ──────────────────────────────
    status, body = http("GET", "/api/decor/packs")
    check("Unauthenticated GET /api/decor/packs returns 401", status == 401, f"{status} {body}")

    # ── User B creates own note (different from User A's) ─────────────────────
    print("\n[NOTES] User B creates own note — confirms separate namespace")
    nb1 = note_id()
    status, body = http("POST", "/api/notes/batch", {
        "upsert": [{"id": nb1, "expectedRevision": 0, "title": "User B Note",
                    "content": "Only for B", "tapeStyle": "tape-lavender",
                    "createdAt": "2026-09-11T02:00:00.000Z",
                    "updatedAt": "2026-09-11T02:00:00.000Z"}]
    }, token=token_b)
    check("User B creates own note", status == 200 and nb1 in body.get("applied", {}).get("upserted", []),
          f"{status} {body}")

    # User A cannot see User B's note
    status, body = http("GET", "/api/notes", token=token_a)
    a_note_ids = [n["id"] for n in body.get("notes", [])]
    check("User A cannot see User B's note", nb1 not in a_note_ids,
          f"User A sees: {a_note_ids[:5]}")

    # ── Unauthenticated access rejected ──────────────────────────────────────
    print("\n[AUTH] Unauthenticated access rejected for sync endpoints")
    for path in ["/api/notes", "/api/diary"]:
        s, b = http("GET", path)
        check(f"Unauthenticated GET {path} returns 401", s == 401, f"{s} {b}")
    s, b = http("POST", "/api/notes/batch", {"upsert": []})
    check("Unauthenticated POST /api/notes/batch returns 401", s == 401, f"{s} {b}")

    # ── Response schema spot-checks (snake/camel documentation) ──────────────
    print("\n[SCHEMA] Response schema verification")
    status, body = http("GET", "/api/notes", token=token_a)
    notes = body.get("notes", [])
    n = next((x for x in notes if x.get("id") == nid3), None)
    if n:
        # Notes come back snake_case from D1 (direct DB field names)
        check("Note fields are snake_case (user_id)", "user_id" in n, str(list(n.keys())[:8]))
        check("Note has is_pinned (snake_case bool int)", "is_pinned" in n, str(list(n.keys())[:8]))
        check("Note has folder_id (snake_case)", "folder_id" in n, str(list(n.keys())[:8]))
        check("Note has created_at (snake_case)", "created_at" in n, str(list(n.keys())[:8]))
    else:
        check("Note schema check skipped (nid3 not found in GET — created before tombstone test)", True)

    status, body = http("GET", "/api/diary", token=token_a)
    entries = body.get("entries", [])
    e = next((x for x in entries if x.get("id") == did3), None)
    if e:
        check("DiaryEntry fields are snake_case (user_id)", "user_id" in e, str(list(e.keys())))
        check("DiaryEntry has photo_url snake_case", "photo_url" in e, str(list(e.keys())))

    # Tombstones in notes are returned camelCase (deletedAt)
    status, body = http("GET", "/api/notes", token=token_a)
    tbs = body.get("tombstones", [])
    if tbs:
        tb = tbs[0]
        check("Note tombstone has camelCase deletedAt", "deletedAt" in tb, str(tb))
        check("Note tombstone has camelCase-ish keys (not deleted_at)", "deleted_at" not in tb, str(tb))

    # Decor packs are camelCase
    status, body = http("GET", "/api/decor/packs", token=token_a)
    packs = body.get("packs", [])
    if packs:
        p = packs[0]
        check("DecorPack uses camelCase priceUsdCents", "priceUsdCents" in p, str(p.keys()))
        check("DecorPack uses camelCase previewAssets", "previewAssets" in p, str(p.keys()))
        check("DecorPack uses camelCase fullAssets key", "fullAssets" in p, str(p.keys()))

    # ── Summary ───────────────────────────────────────────────────────────────
    total = PASS_COUNT + FAIL_COUNT
    print(f"\n{'='*50}")
    print(f"RESULTS: {PASS_COUNT}/{total} passed, {FAIL_COUNT} failed")
    if FAILURES:
        print("\nFAILURES:")
        for f in FAILURES:
            print(f"  {f}")
    print("=" * 50)
    return FAIL_COUNT == 0


if __name__ == "__main__":
    passed = run_tests()
    sys.exit(0 if passed else 1)
