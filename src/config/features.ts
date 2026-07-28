// ─────────────────────────────────────────────────────────────────────────────
// LAUNCH PHASE SWITCH
//
// We are launching creators-only: brands cannot register or use brand-side
// functionality. Everything brand-related is gated behind this one flag.
//
// ► TO RE-OPEN THE PLATFORM TO BRANDS:
//     1. Set BRANDS_ENABLED = true (below), rebuild + deploy the frontend.
//     2. Set BRANDS_ENABLED=true in the backend .env, restart the server.
//   Nothing else needs to change — no code is removed, only gated.
// ─────────────────────────────────────────────────────────────────────────────
export const BRANDS_ENABLED = false;
