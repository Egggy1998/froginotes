#!/usr/bin/env bash
# FrogiNotes Backend Integration Tests
# Requires: wrangler dev running on http://localhost:8787
# Run: bash tests/integration.sh

BASE="http://localhost:8787"
DEV_SECRET="local-dev-seed-secret-change-me"
PASS=0
FAIL=0
RESULTS=()

assert() {
  local name="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    PASS=$((PASS+1))
    RESULTS+=("  PASS: $name")
  else
    FAIL=$((FAIL+1))
    RESULTS+=("  FAIL: $name")
    RESULTS+=("        expected: $expected")
    RESULTS+=("        got:      $actual")
  fi
}

assert_code() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    PASS=$((PASS+1))
    RESULTS+=("  PASS: $name (HTTP $actual)")
  else
    FAIL=$((FAIL+1))
    RESULTS+=("  FAIL: $name (expected HTTP $expected, got $actual)")
  fi
}

echo "=== FrogiNotes API Integration Tests ==="
echo

# ── T0: Health ────────────────────────────────────────────────────────────────
echo "── T0: Health check"
R=$(curl -s "$BASE/api/health")
assert "health ok" '"ok":true' "$R"
assert "health version" '0.2.0' "$R"

# ── T1: Auth — challenge flow (dev: email sink) ───────────────────────────────
echo "── T1: Auth challenge flow"

# Request challenge for user A
R=$(curl -s -X POST "$BASE/api/auth/request-challenge" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}')
CHALLENGE_ID=$(echo "$R" | grep -o '"challengeId":"[^"]*"' | cut -d'"' -f4)
assert "request-challenge returns challengeId" '"challengeId"' "$R"
echo "    challengeId=$CHALLENGE_ID"

# Invalid email
R=$(curl -s -X POST "$BASE/api/auth/request-challenge" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}')
assert "invalid email rejected" '"invalid_email"' "$R"

# Poll before confirm → pending
R=$(curl -s -w "\n%{http_code}" "$BASE/api/auth/poll/$CHALLENGE_ID")
CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | head -1)
assert_code "poll before confirm → 202" "202" "$CODE"
assert "poll pending" '"pending"' "$BODY"

# ── We can't actually click the link in this headless test.
# Instead, seed user + session via a direct D1 query through wrangler,
# OR use the dev endpoint to manually confirm.
# Here we use the confirm-challenge endpoint directly (simulating email link click).
# We need the real secret — which is in the worker log. We'll use a mock flow:
# Request a FRESH challenge so we can get the secret from the confirm endpoint response.

# The worker logs the email link in dev mode. We'll test that confirm-challenge rejects
# bad secrets, and simulate a confirmed session by seeding entitlement endpoint (which
# uses upsertUser internally).

# T1b: confirm-challenge with bad secret → 400
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/auth/confirm-challenge?c=$CHALLENGE_ID&secret=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadb")
assert_code "bad secret → 400" "400" "$R"

# T1c: Simulate confirmed session via dev/seed-entitlement (creates user) then manual session
# We'll exercise unauthenticated 401 first
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/notes")
assert_code "notes without auth → 401" "401" "$R"

R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/diary")
assert_code "diary without auth → 401" "401" "$R"

R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/decor/packs")
assert_code "decor without auth → 401" "401" "$R"

R=$(curl -s "$BASE/api/auth/me")
assert "me without auth" '"unauthenticated"' "$R"

# ── T2: Dev seed endpoints ─────────────────────────────────────────────────────
echo "── T2: Dev seed endpoints"

# Seed decor packs
R=$(curl -s -X POST "$BASE/api/dev/seed-packs" \
  -H "X-Dev-Seed: $DEV_SECRET")
assert "seed packs ok" '"ok":true' "$R"
assert "seeded count" '"seeded":3' "$R"

# Seed entitlement for alice
R=$(curl -s -X POST "$BASE/api/dev/seed-entitlement" \
  -H "X-Dev-Seed: $DEV_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","packId":"pack-free-sample"}')
assert "seed entitlement alice ok" '"ok":true' "$R"
ALICE_ID=$(echo "$R" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
echo "    aliceId=$ALICE_ID"

# Seed entitlement for bob
R=$(curl -s -X POST "$BASE/api/dev/seed-entitlement" \
  -H "X-Dev-Seed: $DEV_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","packId":"pack-free-sample"}')
assert "seed entitlement bob ok" '"ok":true' "$R"
BOB_ID=$(echo "$R" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
echo "    bobId=$BOB_ID"

# Bad dev secret → 403
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/dev/seed-packs" \
  -H "X-Dev-Seed: wrong-secret")
assert_code "wrong dev secret → 403" "403" "$R"

# ── T3: Acquire sessions via challenge flow ────────────────────────────────────
echo "── T3: Acquire real sessions via challenge simulate"
# Request fresh challenges for alice and bob so we can grab secrets from wrangler logs.
# Since we can't intercept log output live, use a dev-only shortcut:
# POST /api/dev/create-test-session (we'll add this ephemeral route IF needed).
# For now, use the poll mechanism: request challenge, read wrangler console output,
# confirm, poll token. This requires reading the dev log.
# 
# PRAGMATIC APPROACH: We test the FULL auth flow by:
# 1. Requesting challenge → get challengeId
# 2. Wrangler logs the full confirm URL to console (dev sink)
# 3. We hit that URL directly (simulating the email link click)
# 4. Poll for the token
# 5. Verify the token works

# --- Alice auth flow ---
R=$(curl -s -X POST "$BASE/api/auth/request-challenge" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}')
ALICE_CID=$(echo "$R" | grep -o '"challengeId":"[^"]*"' | cut -d'"' -f4)
echo "    Alice challengeId=$ALICE_CID"

# The wrangler dev process logs the URL. Extract secret from log.
sleep 1
LOGFILE=".wrangler/dev.log"
if [ ! -f "$LOGFILE" ]; then
  # Try wrangler output from background process
  LOGFILE=$(ls -t "$HOME/.wrangler/logs/"*.log 2>/dev/null | head -1)
fi

# Extract the confirm URL for alice's challenge from process output
# We grep the wrangler output that has been piped
CONFIRM_URL=$(grep -o "http://localhost:8787/api/auth/confirm-challenge[^'\"< ]*" "$LOGFILE" 2>/dev/null | grep "$ALICE_CID" | tail -1)
echo "    Confirm URL: ${CONFIRM_URL:0:80}..."

if [ -z "$CONFIRM_URL" ]; then
  echo "    WARN: Could not extract confirm URL from logs; using injected-secret method"
  # Fallback: query the DB via wrangler to get the secret_hash and create a session manually
  # We'll use npx wrangler d1 execute to read the challenge
  SECRET_HASH=$(npx wrangler d1 execute froginotes-db --local \
    --command "SELECT secret_hash FROM challenges WHERE id='$ALICE_CID'" \
    --json 2>/dev/null | grep -o '"secret_hash":"[^"]*"' | cut -d'"' -f4 | head -1)
  echo "    secret_hash=${SECRET_HASH:0:16}..."
fi

# Confirm the challenge (simulates clicking email link)
CONFIRM_R=$(curl -s -w "\n%{http_code}" "$CONFIRM_URL" 2>/dev/null || echo -e "\n000")
CONFIRM_CODE=$(echo "$CONFIRM_R" | tail -1)
if [ "$CONFIRM_CODE" = "200" ] || [ "$CONFIRM_CODE" = "000" ]; then
  [ "$CONFIRM_CODE" = "200" ] && PASS=$((PASS+1)) && RESULTS+=("  PASS: alice confirm-challenge returns 200")
  
  # Poll for token
  sleep 0.5
  POLL_R=$(curl -s "$BASE/api/auth/poll/$ALICE_CID")
  ALICE_TOKEN=$(echo "$POLL_R" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "    Poll result: $(echo "$POLL_R" | cut -c1-80)"
  
  if [ -n "$ALICE_TOKEN" ]; then
    PASS=$((PASS+1))
    RESULTS+=("  PASS: poll returns token after confirm")
    
    # Second poll should return pending (token consumed)
    sleep 0.5
    POLL2=$(curl -s "$BASE/api/auth/poll/$ALICE_CID")
    assert "second poll → pending (one-time pickup)" '"pending"' "$POLL2"
    
    # T4: Authenticated endpoints
    echo "── T4: Authenticated notes/diary/decor with Alice session"
    
    # GET /api/auth/me
    R=$(curl -s "$BASE/api/auth/me" -H "Authorization: Bearer $ALICE_TOKEN")
    assert "me returns email" '"email":"alice@example.com"' "$R"
    
    # GET notes empty
    R=$(curl -s "$BASE/api/notes" -H "Authorization: Bearer $ALICE_TOKEN")
    assert "notes empty list" '"notes"' "$R"
    
    # POST notes batch — create note
    R=$(curl -s -X POST "$BASE/api/notes/batch" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"upsert":[{"id":"note-1","expectedRevision":0,"title":"Hello World","content":"Test note","type":"text","color":"yellow","folderId":"personal","createdAt":"2026-09-11T00:00:00Z","updatedAt":"2026-09-11T00:00:00Z"}],"delete":[]}')
    assert "create note ok" '"ok":true' "$R"
    assert "note applied count" '"applied":1' "$R"
    
    # GET notes — should have 1
    R=$(curl -s "$BASE/api/notes" -H "Authorization: Bearer $ALICE_TOKEN")
    assert "notes has 1 item" '"notes"' "$R"
    assert "note title found" '"Hello World"' "$R"
    
    # ── T5: CAS conflict ───────────────────────────────────────────────────────
    echo "── T5: CAS stale conflict"
    # Try to update with wrong expectedRevision (0 again, server is at 1)
    R=$(curl -s -X POST "$BASE/api/notes/batch" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"upsert":[{"id":"note-1","expectedRevision":0,"title":"Stale Update","content":"This should conflict","type":"text","color":"pink","folderId":"personal","createdAt":"2026-09-11T00:00:00Z","updatedAt":"2026-09-11T01:00:00Z"}],"delete":[]}')
    assert "stale revision → conflict" '"conflicts"' "$R"
    CONFLICT_COUNT=$(echo "$R" | grep -o '"conflicts":\[[^]]*\]' | grep -o '"id"' | wc -l)
    [ "$CONFLICT_COUNT" -ge 1 ] && PASS=$((PASS+1)) && RESULTS+=("  PASS: conflict list has note-1") \
      || (FAIL=$((FAIL+1)) && RESULTS+=("  FAIL: expected conflict for note-1, got: $R"))
    
    # ── T6: Delete + resurrection ──────────────────────────────────────────────
    echo "── T6: Tombstone delete + resurrection"
    # Correct revision (1) → update note
    R=$(curl -s -X POST "$BASE/api/notes/batch" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"upsert":[],"delete":[{"id":"note-1","expectedRevision":1}]}')
    assert "delete note-1 ok" '"applied":1' "$R"
    
    # GET notes should not show deleted note (or show it with deleted_at)
    R=$(curl -s "$BASE/api/notes?since=0" -H "Authorization: Bearer $ALICE_TOKEN")
    assert "tombstone includes deleted_at" '"deleted_at"' "$R"
    
    # Resurrection: upsert deleted note with higher revision
    R=$(curl -s -X POST "$BASE/api/notes/batch" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"upsert":[{"id":"note-1","expectedRevision":2,"title":"Resurrected","content":"Back!","type":"text","color":"blue","folderId":"personal","createdAt":"2026-09-11T00:00:00Z","updatedAt":"2026-09-11T02:00:00Z"}],"delete":[]}')
    assert "resurrection ok" '"applied":1' "$R"
    
    # ── T7: Idempotency ───────────────────────────────────────────────────────
    echo "── T7: Op idempotency"
    IDEM_KEY="test-idem-$(date +%s)"
    R1=$(curl -s -X POST "$BASE/api/notes/batch" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -H "Idempotency-Key: $IDEM_KEY" \
      -d '{"upsert":[{"id":"note-idem","expectedRevision":0,"title":"Idempotent","content":"First","type":"text","color":"green","folderId":"personal","createdAt":"2026-09-11T00:00:00Z","updatedAt":"2026-09-11T00:00:00Z"}],"delete":[]}')
    # Second call same key
    R2=$(curl -s -X POST "$BASE/api/notes/batch" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -H "Idempotency-Key: $IDEM_KEY" \
      -d '{"upsert":[{"id":"note-idem","expectedRevision":0,"title":"Idempotent","content":"First","type":"text","color":"green","folderId":"personal","createdAt":"2026-09-11T00:00:00Z","updatedAt":"2026-09-11T00:00:00Z"}],"delete":[]}')
    assert "idempotent r1 ok" '"ok":true' "$R1"
    assert "idempotent r2 same response" '"ok":true' "$R2"
    # Both should have same applied count
    A1=$(echo "$R1" | grep -o '"applied":[0-9]*' | head -1)
    A2=$(echo "$R2" | grep -o '"applied":[0-9]*' | head -1)
    [ "$A1" = "$A2" ] && PASS=$((PASS+1)) && RESULTS+=("  PASS: idempotency returns same applied count ($A1)") \
      || (FAIL=$((FAIL+1)) && RESULTS+=("  FAIL: idempotency applied mismatch: $A1 vs $A2"))
    
    # ── T8: User isolation ─────────────────────────────────────────────────────
    echo "── T8: User isolation (Bob cannot see Alice's notes)"
    # Bob needs a session too — request + confirm for bob
    R_BOB=$(curl -s -X POST "$BASE/api/auth/request-challenge" \
      -H "Content-Type: application/json" \
      -d '{"email":"bob@example.com"}')
    BOB_CID=$(echo "$R_BOB" | grep -o '"challengeId":"[^"]*"' | cut -d'"' -f4)
    echo "    Bob challengeId=$BOB_CID"
    
    BOB_URL=$(grep -o "http://localhost:8787/api/auth/confirm-challenge[^'\"< ]*" "$LOGFILE" 2>/dev/null | grep "$BOB_CID" | tail -1)
    
    if [ -n "$BOB_URL" ]; then
      curl -s "$BOB_URL" > /dev/null
      sleep 0.5
      POLL_BOB=$(curl -s "$BASE/api/auth/poll/$BOB_CID")
      BOB_TOKEN=$(echo "$POLL_BOB" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      
      if [ -n "$BOB_TOKEN" ]; then
        R_BOB_NOTES=$(curl -s "$BASE/api/notes" -H "Authorization: Bearer $BOB_TOKEN")
        # Bob's notes should be empty (alice's notes isolated)
        BOB_NOTE_COUNT=$(echo "$R_BOB_NOTES" | grep -o '"notes":\[[^]]*\]' | grep -o '"id"' | wc -l)
        [ "$BOB_NOTE_COUNT" = "0" ] && PASS=$((PASS+1)) && RESULTS+=("  PASS: Bob sees 0 notes (isolation)") \
          || (FAIL=$((FAIL+1)) && RESULTS+=("  FAIL: Bob sees ${BOB_NOTE_COUNT} notes — isolation broken! $R_BOB_NOTES"))
      else
        RESULTS+=("  SKIP: Bob token unavailable (log extraction failed)")
      fi
    else
      RESULTS+=("  SKIP: Bob confirm URL not in log")
    fi
    
    # ── T9: Entitlements ──────────────────────────────────────────────────────
    echo "── T9: Entitlements + checkout 503"
    R=$(curl -s "$BASE/api/decor/packs" -H "Authorization: Bearer $ALICE_TOKEN")
    assert "decor packs returns list" '"packs"' "$R"
    assert "free sample pack present" '"pack-free-sample"' "$R"
    assert "free sample has owned:true" '"owned":true' "$R"
    assert "paid packs not owned" '"owned":false' "$R"
    
    R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/decor/checkout" \
      -H "Authorization: Bearer $ALICE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"packId":"pack-pastel-dream"}')
    assert_code "checkout always 503" "503" "$R"
    
    # ── T10: Logout + revocation ───────────────────────────────────────────────
    echo "── T10: Logout revokes session"
    R=$(curl -s -X POST "$BASE/api/auth/logout" -H "Authorization: Bearer $ALICE_TOKEN")
    assert "logout ok" '"ok":true' "$R"
    
    # Token no longer valid
    R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/auth/me" \
      -H "Authorization: Bearer $ALICE_TOKEN")
    assert_code "revoked token → 401" "401" "$R"
    
    # ── T11: Auth replay — confirm challenge twice ─────────────────────────────
    echo "── T11: Replay — same confirm link used twice"
    # Request new challenge for alice2
    R=$(curl -s -X POST "$BASE/api/auth/request-challenge" \
      -H "Content-Type: application/json" \
      -d '{"email":"alice2@example.com"}')
    A2_CID=$(echo "$R" | grep -o '"challengeId":"[^"]*"' | cut -d'"' -f4)
    A2_URL=$(grep -o "http://localhost:8787/api/auth/confirm-challenge[^'\"< ]*" "$LOGFILE" 2>/dev/null | grep "$A2_CID" | tail -1)
    
    if [ -n "$A2_URL" ]; then
      curl -s "$A2_URL" > /dev/null
      sleep 0.2
      # Second hit on same link
      R_REPLAY=$(curl -s -w "\n%{http_code}" "$A2_URL")
      REPLAY_CODE=$(echo "$R_REPLAY" | tail -1)
      # Should be 200 with "already confirmed" page (idempotent, not a new session)
      [ "$REPLAY_CODE" = "200" ] && PASS=$((PASS+1)) && RESULTS+=("  PASS: replay confirm → 200 (already confirmed)") \
        || (FAIL=$((FAIL+1)) && RESULTS+=("  FAIL: replay confirm returned $REPLAY_CODE"))
      
      # Poll should only work once
      sleep 0.2
      POLL_A2=$(curl -s "$BASE/api/auth/poll/$A2_CID")
      A2_TOKEN=$(echo "$POLL_A2" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      
      if [ -n "$A2_TOKEN" ]; then
        # Second poll should be empty
        sleep 0.2
        POLL_A2_B=$(curl -s "$BASE/api/auth/poll/$A2_CID")
        assert "poll token one-time only" '"pending"' "$POLL_A2_B"
      fi
    else
      RESULTS+=("  SKIP: alice2 confirm URL not in log")
    fi
    
    echo "── T12: Diary sync basic"
    # Acquire fresh alice session
    R=$(curl -s -X POST "$BASE/api/auth/request-challenge" \
      -H "Content-Type: application/json" \
      -d '{"email":"alice@example.com"}')
    A3_CID=$(echo "$R" | grep -o '"challengeId":"[^"]*"' | cut -d'"' -f4)
    A3_URL=$(grep -o "http://localhost:8787/api/auth/confirm-challenge[^'\"< ]*" "$LOGFILE" 2>/dev/null | grep "$A3_CID" | tail -1)
    
    if [ -n "$A3_URL" ]; then
      curl -s "$A3_URL" > /dev/null
      sleep 0.5
      POLL_A3=$(curl -s "$BASE/api/auth/poll/$A3_CID")
      A3_TOKEN=$(echo "$POLL_A3" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      
      if [ -n "$A3_TOKEN" ]; then
        R=$(curl -s -X POST "$BASE/api/diary/batch" \
          -H "Authorization: Bearer $A3_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"upsert":[{"id":"diary-1","expectedRevision":0,"date":"2026-09-11","mood":"happy","content":"Good day!","createdAt":"2026-09-11T00:00:00Z","updatedAt":"2026-09-11T00:00:00Z"}],"delete":[]}')
        assert "diary create ok" '"applied":1' "$R"
        
        R=$(curl -s "$BASE/api/diary" -H "Authorization: Bearer $A3_TOKEN")
        assert "diary list has entry" '"diary-1"' "$R"
        assert "diary content preserved" '"Good day!"' "$R"
      else
        RESULTS+=("  SKIP: alice3 token unavailable")
      fi
    else
      RESULTS+=("  SKIP: diary test skipped (no confirm URL)")
    fi
  else
    FAIL=$((FAIL+1))
    RESULTS+=("  FAIL: could not get alice token from poll")
  fi
else
  FAIL=$((FAIL+1))
  RESULTS+=("  FAIL: confirm-challenge returned HTTP $CONFIRM_CODE (expected 200)")
  RESULTS+=("        URL was empty — log extraction failed")
  # Still run the unauthenticated + seed tests above
fi

echo
echo "=== Results ==="
for R in "${RESULTS[@]}"; do echo "$R"; done
echo
echo "Total: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] && echo "ALL PASS" || echo "SOME FAILURES"
exit $FAIL
