#!/usr/bin/env bash
#
# Security smoke test for the influ-link backend (Tiers 0-2).
# Verifies the middleware-level hardening: auth gating, SSRF lockdown,
# security headers, and login rate limiting.
#
# Target is the Vite dev origin (http://localhost:5173), which proxies /api
# to the backend on :3000 (see vite.config.ts). So you need BOTH running:
#   1) backend:  node server.js          (listens on :3000)
#   2) frontend: npm run dev             (listens on :5173, proxies /api -> :3000)
# Or let this script boot the backend for you with BOOT_BACKEND=1.
#
# Usage:
#   npm run dev            # in one terminal (keeps 5173 up)
#   BOOT_BACKEND=1 ./smoke-test-security.sh
#
#   # if you already have both servers running:
#   ./smoke-test-security.sh
#
#   BASE_URL=http://localhost:5173 ./smoke-test-security.sh
#
# SAFETY: refuses to run against *.influ-link.com unless FORCE=1 (it fires
# ~25 login attempts and would trip production rate limits).

set -u

BASE_URL="${BASE_URL:-http://localhost:5173}"
BOOT_BACKEND="${BOOT_BACKEND:-0}"
FORCE="${FORCE:-0}"
SAFE="${SAFE:-0}"          # SAFE=1 skips the destructive login-flood test
PASS=0
FAIL=0
SERVER_PID=""

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    echo ""
    echo "Stopping backend (pid $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null
  fi
}
trap cleanup EXIT

# status code of a request
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

# --- Guard against production ---
# The only destructive test is the login flood (#5). Running against production
# is allowed when SAFE=1 (which skips that test); otherwise require FORCE=1.
case "$BASE_URL" in
  *influ-link.com*)
    if [ "$SAFE" != "1" ] && [ "$FORCE" != "1" ]; then
      echo "Refusing to run the login-flood test against production ($BASE_URL)."
      echo "Use SAFE=1 to run only the non-destructive checks, or FORCE=1 to override."
      exit 2
    fi
    ;;
esac

echo "Target: $BASE_URL  (Vite proxy -> backend :3000)"
echo ""

# --- Tier 0: static check ---
echo "== Tier 0: static checks =="
if node --check server.js; then
  pass "node --check server.js"
else
  fail "node --check server.js"
fi
echo ""

# --- Optionally boot the backend on :3000 ---
if [ "$BOOT_BACKEND" = "1" ]; then
  echo "== Booting backend on :3000 =="
  node server.js > server.smoke.log 2>&1 &
  SERVER_PID=$!
  echo "Started node (pid $SERVER_PID), waiting for :3000..."
  for _ in $(seq 1 30); do
    if curl -s -o /dev/null "http://localhost:3000/"; then break; fi
    sleep 1
  done
  echo ""
fi

# --- Verify the target (Vite) is reachable ---
if ! curl -s -o /dev/null "$BASE_URL/"; then
  echo "Cannot reach $BASE_URL."
  echo "Start the frontend dev server first:  npm run dev"
  echo "and make sure the backend is up (node server.js) or pass BOOT_BACKEND=1."
  exit 1
fi

# --- Verify /api actually reaches the backend ---
proxy_code=$(code "$BASE_URL/api/notifications")
if [ "$proxy_code" = "401" ]; then
  echo "API reachable: /api enforces auth (got 401 as expected)."
elif [ "$proxy_code" = "200" ] || [ "$proxy_code" = "404" ]; then
  echo "WARNING: /api returned $proxy_code — the request may be hitting a static"
  echo "SPA/proxy instead of the backend. Check that the backend is deployed and up."
fi
echo ""

# --- Tier 2: middleware-level tests (via the proxy) ---
echo "== Tier 2: security behaviour =="

# 1. Security headers (helmet) — check an /api response, not the SPA root
if curl -s -D - -o /dev/null "$BASE_URL/api/notifications" | grep -qi "x-content-type-options"; then
  pass "helmet: X-Content-Type-Options header present on /api"
else
  fail "helmet: X-Content-Type-Options header MISSING on /api"
fi

# 2. Auth gating on creator search
c=$(code -X POST "$BASE_URL/api/creators/search" -H "Content-Type: application/json" -d '{}')
if [ "$c" = "401" ]; then pass "creators/search requires auth (401)"; else fail "creators/search expected 401, got $c"; fi

# 3. Auth gating on consent update
c=$(code -X POST "$BASE_URL/api/consent/update" -H "Content-Type: application/json" -d '{"analytics":true}')
if [ "$c" = "401" ]; then pass "consent/update requires auth (401)"; else fail "consent/update expected 401, got $c"; fi

# 4. SSRF lockdown on image proxy
c=$(code "$BASE_URL/api/instagram/proxy-image?url=http://169.254.169.254/latest/meta-data/")
if [ "$c" = "401" ]; then pass "proxy-image blocks unauthenticated SSRF (401)"; else fail "proxy-image expected 401, got $c"; fi

# 5. Login rate limiting (fire 25, expect the tail to be 429)
#    DESTRUCTIVE: this rate-limits the login endpoint for ~15 min, so it is
#    skipped in SAFE mode (production verification).
if [ "$SAFE" = "1" ]; then
  echo "  [SKIP] login rate-limit flood (SAFE=1 — would rate-limit real users)"
else
  echo "  ...firing 25 login attempts to trip the rate limiter"
  last=""
  for _ in $(seq 1 25); do
    last=$(code -X POST "$BASE_URL/api/login" -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"wrong"}')
  done
  if [ "$last" = "429" ]; then pass "login rate limit trips (429)"; else fail "login rate limit expected 429, got $last"; fi
fi

echo ""
echo "== Summary =="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""
echo "Note: the login endpoint is now rate-limited for ~15 min. That's expected."

if [ "$FAIL" -gt 0 ]; then exit 1; fi
exit 0
