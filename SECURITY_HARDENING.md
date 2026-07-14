# Backend Security Hardening — Change Brief

**Date:** 2026-07-11
**Scope:** `server.js` (Express/Socket.io API) + one frontend caller (`src/App.tsx`)
**Status:** Applied to the repo working tree. **Not committed. Not yet deployed.**

> ⚠️ Production `server.js` runs on DigitalOcean and can drift from this repo. Reconcile
> against the live file before deploying these changes.

---

## 1. Summary

An audit of the backend surfaced credential leaks, an SSRF hole, two SQL-injection
vectors, destructive startup code, several broken auth/ownership checks, and missing
platform-level protections (no rate limiting, no security headers, unrestricted uploads).

This brief documents the fixes that were applied. New dependencies added: `helmet`,
`express-rate-limit`.

---

## 2. Critical fixes

| # | Issue | Fix | Location |
|---|-------|-----|----------|
| 1 | **Instagram access token leaked** to any logged-in user via `/api/instagram/analytics/:userId` | Token is used server-side only; `delete data.access_token` before responding | `server.js` |
| 2 | **SSRF** — `/api/instagram/proxy-image` fetched any URL (cloud metadata, localhost, internal services) with no auth | Added `authenticate` + HTTPS-only hostname allowlist (`*.cdninstagram.com`, `*.fbcdn.net`, `*.fbsbx.com`) + `image/*` content-type check | `server.js` |
| 3 | **Destructive boot code** — `migrateExistingConnections()` assigned every creator to every campaign with random earnings/reach on each startup | Startup call disabled (function kept for reference/local seeding only) | `server.js` |
| 4 | **SQL injection** — user-supplied platform names interpolated into a `JSON_EXTRACT` path in `/api/creators/search` | Canonical platform whitelist + bound `?` parameters; route also now requires auth | `server.js` |
| 5 | **SQL injection vector** — `accountType` interpolated into the `/api/links` UNION query | Strict `brand`/`creator` allowlist guard rejects any other value | `server.js` |

---

## 3. Runtime-crash & correctness bugs (also compliance)

- **Missing `fs` and `crypto` imports** — caused hard crashes in campaign-image edits and
  the **Meta data-deletion callback** (a GDPR / Meta app-review requirement). Imports added.
- **`/api/payouts/setup`** used PostgreSQL `$1` placeholders and `.rows` against the MySQL
  pool — rewritten to mysql2 syntax.
- **Stripe onboarding URL** was hardcoded to `http://localhost:5173` — now uses
  `process.env.FRONTEND_URL` with a localhost dev fallback.

---

## 4. Authorization / IDOR / abuse fixes

- **Ownership now bound to the JWT, not URL params**, on:
  - Add portfolio post (`POST /api/profiles/:profileId/portfolio`)
  - Delete portfolio post (`DELETE .../portfolio/:postId`)
  - Delete campaign (`DELETE /api/campaigns/:profileId/:campaignId`) — now requires auth
  - Impression tracking (`POST /api/:userId/campaigns/:campaignId/impression`) — now requires auth
- **`/api/consent/update`** now requires auth and scopes by `req.user.id` (previously anyone
  could rewrite another user's GDPR consent flags by supplying an email). Frontend caller in
  `src/App.tsx` updated to send `credentials`.
- **`/api/notifications` POST** can no longer target arbitrary users — forced to `req.user.id`.

---

## 5. Platform hardening

- **`helmet`** security headers (CSP disabled — API server; `crossOriginResourcePolicy`
  relaxed so `/uploads` assets load from the frontend subdomain).
- **`express-rate-limit`**: 20 requests / 15 min on `/api/login` and `/api/register`,
  120 / min on the rest of `/api`, Stripe webhook exempt.
- **`trust proxy: 1`** so per-IP rate limiting and `req.ip` work correctly behind the
  DigitalOcean load balancer (otherwise all users share one bucket).
- **File uploads**: multer restricted to JPEG/PNG/WebP/GIF, 5 MB cap; `/uploads` served with
  `X-Content-Type-Options: nosniff` and a sandbox CSP to neutralize stored-XSS via uploaded
  SVG/HTML.
- **CORS**: localhost / Tailscale dev origins are excluded when `NODE_ENV=production`.
- Removed webhook logging that printed partial signing secrets.

---

## 6. Known follow-ups (NOT done — need decisions)

| Item | Why deferred |
|------|--------------|
| **CSRF protection** | Cookies are `sameSite:none`; forged cross-site POSTs remain possible. Proper fix needs a CSRF token plumbed through the frontend. |
| **Encrypt IG tokens at rest** | Needs a key-management decision + data migration. |
| **JWT revocation on logout** | Tokens stay valid 7–30 days; needs a refresh-token / denylist design. |
| **`/api/profiles/:profileId/analytics` IDOR** | Left as-is — appears intentionally viewable by brands vetting creators. Confirm intended visibility. |
| **Behavior change** | `/api/creators/search` now requires login (was the only search route that didn't). Revisit if a logged-out browse experience is needed. |

---

## 7. Verification performed

- `node --check server.js` → passes.
- `helmet` and `express-rate-limit` import cleanly under ESM.
- Frontend callers confirmed to already send `credentials` (or updated to do so) for every
  route where auth was tightened, so no client breakage is expected.

Full runtime verification (DB + Redis + Stripe) was not possible in this environment and
should be run against staging before deploy.
