// server.js (ES Modules)
import "dotenv/config";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createNotification } from "./src/utils/notifications.js";
// Security helpers are inlined below (see "SECURITY HELPERS") so the backend
// deploys as a single server.js file with no extra local modules to upload.
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import cron from "node-cron";
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Stripe from 'stripe';
import { Resend } from "resend";
// Pin the API version so object shapes can't shift under us if the account's
// dashboard default is ever changed/upgraded. Set to the account's current
// default (see any webhook event's "API version"), so pinning changes nothing
// today — it only locks today's behavior. Bump deliberately, and re-check the
// field reads (esp. subscription period end, which moved to the item level in
// the 2025+ line) when you do.
const STRIPE_API_VERSION = "2026-03-25.dahlia";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });

// --- Email via Resend (HTTPS API; DigitalOcean blocks outbound SMTP) ---
// RESEND_API_KEY is required to actually send. MAIL_FROM must be a Resend-verified
// domain address (or the shared onboarding@resend.dev, which only delivers to the
// Resend account owner's own address until a domain is verified).
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MAIL_FROM = process.env.MAIL_FROM || "InfluLink <onboarding@resend.dev>";

// Unified sender used by both the contact form and the security alerter.
// Returns { id } on success, { skipped: true } if unconfigured, { error } on failure.
async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!resend) {
    console.warn("[MAIL] RESEND_API_KEY not set; email skipped:", subject);
    return { skipped: true };
  }
  if (!to) {
    console.warn("[MAIL] no recipient; email skipped:", subject);
    return { skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[MAIL] Resend error:", error);
      return { error };
    }
    return { id: data?.id };
  } catch (err) {
    console.error("[MAIL] send failed:", err.message);
    return { error: err };
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// SECURITY HELPERS (inlined; no external local modules, no extra deps)
// =======================

// --- Column encryption (item #7): AES-256-GCM for secrets at rest ---
// ENCRYPTION_KEY must be 64 hex chars (32 bytes). If unset/invalid, values are
// stored as-is so the app keeps working — set the key to enable encryption.
// Encrypted values carry the "enc:v1:" prefix; anything without it is treated as
// legacy plaintext, so migration is seamless and reads never break.
const ENC_PREFIX = "enc:v1:";
const ENC_KEY = (() => {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    console.warn("[CRYPTO] ENCRYPTION_KEY not set — sensitive columns stored in plaintext.");
    return null;
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    console.error("[CRYPTO] ENCRYPTION_KEY must be 64 hex chars (32 bytes); encryption disabled.");
    return null;
  }
  return key;
})();

function encryptSecret(plain) {
  if (plain == null || !ENC_KEY) return plain;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
    const ct = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return (
      ENC_PREFIX +
      [iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":")
    );
  } catch (err) {
    console.error("[CRYPTO] encrypt failed:", err.message);
    return plain;
  }
}

function decryptSecret(value) {
  if (typeof value !== "string" || !value.startsWith(ENC_PREFIX)) return value; // legacy plaintext
  if (!ENC_KEY) {
    console.error("[CRYPTO] encrypted value present but ENCRYPTION_KEY not set.");
    return null;
  }
  try {
    const [ivB64, tagB64, ctB64] = value.slice(ENC_PREFIX.length).split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const pt = Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]);
    return pt.toString("utf8");
  } catch (err) {
    console.error("[CRYPTO] decrypt failed:", err.message);
    return null;
  }
}

// Password strength policy (item #5): min 8 chars with lower, upper and a digit.
// Returns null when valid, else a human-readable error message.
function validatePassword(pw) {
  if (typeof pw !== "string" || pw.length < 8)
    return "Password must be at least 8 characters";
  if (pw.length > 128) return "Password is too long";
  if (!/[a-z]/.test(pw)) return "Password must contain a lowercase letter";
  if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(pw)) return "Password must contain a number";
  return null;
}

// Field honeypot (item #2): a hidden form field real users never fill.
const HONEYPOT_FIELD = "website";
function isHoneypotTripped(body) {
  const v = body?.[HONEYPOT_FIELD];
  return typeof v === "string" && v.trim() !== "";
}

// Timing honeypot (item #2): humans can't submit a form in under ~1.2s.
// Absent/odd values are treated as "not a bot" so real clients are never blocked.
const TIMING_FIELD = "formLoadedAt";
const MIN_SUBMIT_MS = 1200;
function isSubmittedTooFast(body) {
  const t = Number(body?.[TIMING_FIELD]);
  if (!t || Number.isNaN(t)) return false;
  const elapsed = Date.now() - t;
  return elapsed >= 0 && elapsed < MIN_SUBMIT_MS;
}

// Minimal login-body validation (item #6). Populates req.validated on success.
function validateLoginBody(req, res, next) {
  const b = req.body || {};
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  if (!emailOk) return res.status(400).json({ message: "Invalid email address" });
  if (!password || password.length > 128)
    return res.status(400).json({ message: "Password is required" });
  req.validated = {
    email,
    password,
    analytics: typeof b.analytics === "boolean" ? b.analytics : undefined,
    marketing: typeof b.marketing === "boolean" ? b.marketing : undefined,
  };
  next();
}

// Structured security-event logging + alerting seam (item #8). Tranche D wires
// maybeSecurityAlert() to email on threshold breaches.
const securityWindows = new Map();
const SECURITY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
function bumpSecurity(key) {
  const now = Date.now();
  const arr = (securityWindows.get(key) || []).filter(
    (t) => now - t < SECURITY_WINDOW_MS
  );
  arr.push(now);
  securityWindows.set(key, arr);
  return arr.length;
}
function logSecurityEvent(type, req, meta = {}) {
  const ip = (req && req.ip) || "unknown";
  const entry = {
    ts: new Date().toISOString(),
    level: "security",
    type,
    ip,
    method: req && req.method,
    path: req && req.originalUrl,
    host: req && req.headers && req.headers.host,
    ua: req && req.headers && req.headers["user-agent"],
    ...meta,
  };
  console.warn("[SECURITY]", JSON.stringify(entry));
  const count = bumpSecurity(`${type}:${ip}`);
  maybeSecurityAlert(type, entry, count);
}
// Email alerting (item #8): notify an admin when an attack signal crosses a
// threshold within the 10-minute window. Degrades to log-only when SMTP isn't
// configured, and is throttled per (type+ip) so a sustained attack can't flood
// the inbox.
const ALERT_THRESHOLDS = {
  login_failed: 8, // repeated bad logins from one IP → likely brute force
  scanner_probe: 1, // any decoy-path hit is worth knowing about
  honeypot_register: 3,
  honeypot_login: 3,
  honeypot_proposal: 3,
  honeypot_campaign: 3,
};
const ALERT_COOLDOWN_MS = 15 * 60 * 1000;
const lastAlertAt = new Map();

// Per-type context for alert emails: what the event means and what to do.
const ALERT_META = {
  scanner_probe: {
    severity: "high",
    title: "Vulnerability scanner probe",
    what: "A request hit a decoy path that only automated vulnerability scanners look for (e.g. /.env, /wp-login.php, /phpmyadmin). Real users never request these, so this is almost certainly an attacker or bot fingerprinting the server.",
    action: "The source IP was automatically blocked for 1 hour. If probing continues from the same network, block it upstream (firewall / Cloudflare). No action needed if this was your own testing.",
  },
  login_failed: {
    severity: "medium",
    title: "Repeated failed logins",
    what: "Several failed login attempts came from a single IP in a short window — the signature of a brute-force or credential-stuffing attempt.",
    action: "The login endpoint is already rate-limited for this IP. If attempts persist, block the IP and consider forcing a password reset on any targeted accounts.",
  },
  honeypot_register: {
    severity: "low",
    title: "Bot signup blocked",
    what: "A registration filled a hidden honeypot field or was submitted implausibly fast — automated bot behaviour, not a real person.",
    action: "The signup was rejected automatically. No action needed unless the volume becomes high.",
  },
  honeypot_login: {
    severity: "low",
    title: "Bot login blocked",
    what: "A login filled a hidden honeypot field or was submitted implausibly fast — automated bot behaviour.",
    action: "The attempt was rejected automatically. No action needed unless the volume becomes high.",
  },
  honeypot_proposal: {
    severity: "low",
    title: "Bot proposal blocked",
    what: "A campaign proposal filled a hidden honeypot field — likely spam automation.",
    action: "The submission was rejected automatically. No action needed unless the volume becomes high.",
  },
  honeypot_campaign: {
    severity: "low",
    title: "Bot campaign blocked",
    what: "A campaign creation filled a hidden honeypot field — likely spam automation.",
    action: "The submission was rejected automatically. No action needed unless the volume becomes high.",
  },
};
const SEVERITY_STYLE = {
  high: { color: "#dc2626", label: "HIGH" },
  medium: { color: "#d97706", label: "MEDIUM" },
  low: { color: "#2563eb", label: "LOW" },
};

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// Build the subject + plain-text + styled HTML for a security alert email.
function buildAlertEmail(type, entry, count, threshold) {
  const meta = ALERT_META[type] || {
    severity: "medium",
    title: `Security event: ${type}`,
    what: "A monitored security event crossed its alert threshold.",
    action: "Review the request details below.",
  };
  const sev = SEVERITY_STYLE[meta.severity] || SEVERITY_STYLE.medium;
  const env = process.env.NODE_ENV || "unknown";

  const rows = [
    ["Event type", type],
    ["Severity", sev.label],
    ["Source IP", entry.ip],
    ["Occurrences", `${count} in 10 min (alerts at ${threshold})`],
    ["Request", `${entry.method || "?"} ${entry.path || "n/a"}`],
    ["Host", entry.host || "n/a"],
    ["User-Agent", entry.ua || "n/a"],
    ["Time (UTC)", entry.ts],
    ["Environment", env],
  ];

  const subject = `[InfluLink] ${sev.label} security alert: ${meta.title} (${entry.ip})`;

  const text =
    `${sev.label} — ${meta.title}\n\n${meta.what}\n\n` +
    `Details\n-------\n` +
    rows.map(([k, v]) => `${(k + ":").padEnd(15)} ${v}`).join("\n") +
    `\n\nRecommended action\n------------------\n${meta.action}\n\n` +
    `—\nAutomated InfluLink security alert. Further ${type} alerts from this IP ` +
    `are suppressed for 15 minutes to avoid flooding your inbox.\n`;

  const rowHtml = rows
    .map(
      ([k, v]) =>
        `<tr>` +
        `<td style="padding:6px 14px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 14px;color:#111827;font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-word;">${escapeHtml(v)}</td>` +
        `</tr>`
    )
    .join("");

  const html = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
  
  <div style="background:white;padding:24px;font-family:'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #1E88E5;">
      
      <div style="background:#1E88E5;padding:16px 24px;">
        <div style="color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.08em;opacity:.9;">${sev.label} SEVERITY</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:2px;">🛡️ ${escapeHtml(meta.title)}</div>
      </div>
      
      <div style="padding:20px 24px;">
        <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6;">${escapeHtml(meta.what)}</p>
        
        <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:8px;border:1px solid #6EC5E9;">${rowHtml}</table>
        
        <div style="margin-top:18px;padding:14px 16px;background:#6EC5E9;border-radius:8px;border-left:4px solid #1E88E5;">
          <div style="font-size:12px;font-weight:700;color:#1E88E5;text-transform:uppercase;letter-spacing:.05em;">Recommended action</div>
          <p style="margin:6px 0 0;color:white;font-size:14px;line-height:1.6;">${escapeHtml(meta.action)}</p>
        </div>
      </div>
      
      <div style="padding:14px 24px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.5;">
        Automated InfluLink security alert. Further <b>${escapeHtml(type)}</b> alerts from this IP are suppressed for 15 minutes to avoid flooding your inbox.
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

// ── Daily security digest ─────────────────────────────────────────────────
// Scanner probes and honeypot trips are constant, already-auto-handled
// background noise. Emailing one per event is pure spam — scanners come from an
// endless supply of fresh IPs, so a per-IP throttle never actually throttles.
// Instead these fold into an in-memory accumulator and go out as ONE digest a
// day. Only actionable signals (brute-force logins) alert in real time.
const DIGEST_ONLY_TYPES = new Set([
  "scanner_probe",
  "honeypot_register",
  "honeypot_login",
  "honeypot_proposal",
  "honeypot_campaign",
]);

// Resets on restart — fine for a "what happened lately" summary; the per-event
// detail is always in the [SECURITY] logs. Map sizes are capped so a flood of
// unique IPs can't grow memory unbounded (existing keys keep counting).
const secDigest = { since: Date.now(), total: 0, byType: new Map(), ips: new Map(), paths: new Map() };
function recordForDigest(type, entry) {
  secDigest.total++;
  secDigest.byType.set(type, (secDigest.byType.get(type) || 0) + 1);
  const ip = entry.ip;
  if (ip && ip !== "unknown" && (secDigest.ips.has(ip) || secDigest.ips.size < 20000)) {
    secDigest.ips.set(ip, (secDigest.ips.get(ip) || 0) + 1);
  }
  if (type === "scanner_probe" && entry.path && (secDigest.paths.has(entry.path) || secDigest.paths.size < 2000)) {
    secDigest.paths.set(entry.path, (secDigest.paths.get(entry.path) || 0) + 1);
  }
}
function resetDigest() {
  secDigest.since = Date.now();
  secDigest.total = 0;
  secDigest.byType.clear();
  secDigest.ips.clear();
  secDigest.paths.clear();
}

// Hard backstop: never more than this many real-time alert emails per hour,
// whatever the cause — so a distributed attack can't flood the inbox.
const MAX_ALERTS_PER_HOUR = 5;
const recentAlerts = [];
function underAlertBudget() {
  const now = Date.now();
  while (recentAlerts.length && now - recentAlerts[0] > 3600000) recentAlerts.shift();
  if (recentAlerts.length >= MAX_ALERTS_PER_HOUR) return false;
  recentAlerts.push(now);
  return true;
}

const topDigest = (map, n = 6) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

function buildDigestEmail() {
  const hrs = Math.max(1, Math.round((Date.now() - secDigest.since) / 3600000));
  const byType = topDigest(secDigest.byType, 20);
  const paths = topDigest(secDigest.paths, 6);
  const ips = topDigest(secDigest.ips, 6);
  const uniqueIps = secDigest.ips.size;

  const subject = `[InfluLink] Security digest — ${secDigest.total} events, ${uniqueIps} IPs (last ${hrs}h)`;

  const text = [
    `Security digest — last ${hrs}h`,
    ``,
    `${secDigest.total} monitored events from ${uniqueIps} unique IP(s), all auto-handled (blocked / rejected).`,
    ``,
    `By type:`,
    ...byType.map(([t, c]) => `  ${(t + ":").padEnd(20)} ${c}`),
    ``,
    `Top probed paths:`,
    ...(paths.length ? paths.map(([p, c]) => `  ${c}x  ${p}`) : ["  (none)"]),
    ``,
    `Top source IPs:`,
    ...(ips.length ? ips.map(([ip, c]) => `  ${c}x  ${ip}`) : ["  (none)"]),
    ``,
    `— Once-a-day summary. Per-event detail is in the server [SECURITY] logs.`,
  ].join("\n");

  const row = (k, v) =>
    `<tr><td style="padding:5px 12px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td>` +
    `<td style="padding:5px 12px;color:#111827;font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-word;">${escapeHtml(v)}</td></tr>`;
  const section = (title, entries, fmt) =>
    `<div style="margin-top:16px;"><div style="font-size:12px;font-weight:700;color:#1E88E5;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">${escapeHtml(title)}</div>` +
    `<table style="width:100%;border-collapse:collapse;border:1px solid #6EC5E9;border-radius:8px;">` +
    (entries.length ? entries.map(fmt).join("") : `<tr><td style="padding:5px 12px;color:#9ca3af;font-size:13px;">none</td></tr>`) +
    `</table></div>`;

  const html = `
  <div style="background:white;padding:24px;font-family:'Rubik',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #1E88E5;">
      <div style="background:#1E88E5;padding:16px 24px;">
        <div style="color:#fff;font-size:12px;font-weight:700;letter-spacing:.08em;opacity:.9;">DAILY DIGEST</div>
        <div style="color:#fff;font-size:20px;font-weight:700;margin-top:2px;">🛡️ ${secDigest.total} events · ${uniqueIps} IPs</div>
      </div>
      <div style="padding:20px 24px;">
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Everything below was handled automatically (scanner IPs blocked, bot submissions rejected) over the last ${hrs}h. Nothing needs action — it's a heads-up on background activity.</p>
        ${section("By type", byType, ([t, c]) => row(t, String(c)))}
        ${section("Top probed paths", paths, ([p, c]) => row(`${c}×`, p))}
        ${section("Top source IPs", ips, ([ip, c]) => row(`${c}×`, ip))}
      </div>
      <div style="padding:14px 24px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.5;">
        Once-a-day summary. Real-time alerts are reserved for actionable events like brute-force logins. Per-event detail is in the server logs.
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

async function sendSecurityDigest() {
  try {
    // Silence is good news — nothing happened, no email.
    if (secDigest.total === 0) return;
    const to = process.env.ALERT_EMAIL_TO || process.env.CONTACT_EMAIL_TO;
    const { subject, text, html } = buildDigestEmail();
    await sendEmail({ to, subject, text, html });
    console.warn(`[SECURITY][DIGEST] sent: ${secDigest.total} events, ${secDigest.ips.size} IPs`);
  } catch (err) {
    console.error("[SECURITY][DIGEST] failed:", err.message);
  } finally {
    resetDigest();
  }
}

async function maybeSecurityAlert(type, entry, count) {
  try {
    // Noisy, auto-handled events fold into the daily digest — never emailed live.
    if (DIGEST_ONLY_TYPES.has(type)) {
      recordForDigest(type, entry);
      return;
    }

    const threshold = ALERT_THRESHOLDS[type];
    if (!threshold || count < threshold) return;

    // Real-time alert (actionable). Per-(type+ip) cooldown AND the global hourly
    // cap, so even a distributed attack can't flood the inbox.
    const key = `${type}:${entry.ip}`;
    const now = Date.now();
    if (now - (lastAlertAt.get(key) || 0) < ALERT_COOLDOWN_MS) return;
    if (!underAlertBudget()) {
      console.warn(`[SECURITY][ALERT] suppressed by hourly cap: ${type} from ${entry.ip}`);
      return;
    }
    lastAlertAt.set(key, now);

    const { subject, text, html } = buildAlertEmail(type, entry, count, threshold);

    // Send via Resend (see sendEmail). Falls back to a log line when unconfigured.
    const to = process.env.ALERT_EMAIL_TO || process.env.CONTACT_EMAIL_TO;
    const result = await sendEmail({ to, subject, text, html });
    if (result.id) {
      console.warn(`[SECURITY][ALERT] email sent: ${subject}`);
    } else {
      console.warn(`[SECURITY][ALERT] ${subject}`);
    }
  } catch (err) {
    console.error("[SECURITY][ALERT] failed:", err.message);
  }
}

const app = express();
// Behind the DigitalOcean load balancer / reverse proxy: trust the first proxy
// hop so req.ip (and per-IP rate limiting) uses the real client address from
// X-Forwarded-For instead of the proxy's address.
app.set("trust proxy", 1);
const httpServer = createServer(app);

// --- Redis Setup ---
const pubClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const subClient = pubClient.duplicate();

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const prodOrigins = [
  "https://influ-link.com",   // Истинският сайт
  "https://www.influ-link.com",
  "https://mvp.influ-link.com",
  "https://www.mvp.influ-link.com" // Версията с www (за всеки случай)
];
const devOrigins = [
  "http://localhost:5173",
  "http://100.119.84.32:5173",
];

// Temporary extra origins, e.g. pointing a local frontend at this server for an
// afternoon's testing. Comma-separated in .env:
//     EXTRA_CORS_ORIGINS=http://localhost:5173
// It lives in .env rather than in this file for two reasons: re-uploading
// server.js can't silently wipe it, and closing the door again is a variable
// change plus a restart instead of a code edit. Leave it unset in normal
// operation — anything listed here is trusted in production.
const extraOrigins = (process.env.EXTRA_CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Dev/localhost/Tailscale origins are never trusted in production.
const allowedOrigins = IS_PRODUCTION
  ? [...prodOrigins, ...extraOrigins]
  : [...prodOrigins, ...devOrigins, ...extraOrigins];

if (IS_PRODUCTION && extraOrigins.length) {
  console.warn(
    `⚠️  [CORS] ${extraOrigins.length} extra origin(s) trusted in production: ${extraOrigins.join(", ")} — unset EXTRA_CORS_ORIGINS when you're done testing.`
  );
}

// --- Socket.io Setup ---
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("🚀 Redis Adapter connected for Socket.io");
}).catch(err => console.error("❌ Redis connection failed:", err));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === "production";

import multer from "multer";
// Only accept real image types, cap size, and never trust the uploaded filename.
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const upload = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
  },
});

// --- Middleware ---

app.use(cors({
  origin: function (origin, callback) {
    // Позволяваме заявки без origin (като мобилни приложения или Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin); // Дебуг лог
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));
// Raw body for Stripe webhook, JSON for everything else
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
  }
});
app.use(cookieParser());

// --- Security headers ---
// CSP is left off because this process is an API server; the SPA is served from
// a separate origin. crossOriginResourcePolicy is relaxed so /uploads assets can
// be loaded from the frontend subdomain.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// --- Honeypot: decoy-endpoint trap + Redis IP blocklist (item #2) ---
// Requests to paths no legitimate client ever touches (scanner probes) get the
// source IP added to a Redis blocklist for an hour; blocked IPs are then
// short-circuited before they can hit any real route. Fails open if Redis is
// unavailable, so a Redis outage never blocks legitimate traffic.
const DECOY_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.aws/i,
  /^\/\.ssh/i,
  /wp-login\.php/i,
  /wp-admin/i,
  /xmlrpc\.php/i,
  /phpmyadmin/i,
  /^\/config\.(json|php|ya?ml)/i,
  /^\/actuator/i,
  /^\/api\/admin/i,
  /^\/api\/v\d+\/admin/i,
  /^\/server-status/i,
  /\.htaccess/i,
];
const BLOCKLIST_TTL = 60 * 60; // seconds (1 hour)
const blockKey = (ip) => `blocklist:${ip}`;

app.use(async (req, res, next) => {
  const ip = req.ip;

  // 1. Short-circuit IPs already on the blocklist.
  try {
    if (pubClient.isReady && ip && (await pubClient.get(blockKey(ip)))) {
      return res.status(403).send("Forbidden");
    }
  } catch (_) {
    /* Redis down → fail open */
  }

  // 2. Trap scanners hitting decoy paths, then block them.
  if (DECOY_PATTERNS.some((re) => re.test(req.path))) {
    logSecurityEvent("scanner_probe", req, { blocked: true });
    try {
      if (pubClient.isReady && ip) {
        await pubClient.set(blockKey(ip), "1", { EX: BLOCKLIST_TTL });
      }
    } catch (_) {
      /* ignore */
    }
    return res.status(404).send("Not found");
  }

  next();
});

// --- Rate limiting ---
// Tight limiter for credential endpoints (brute-force protection), looser one
// for the rest of the API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
// Contact form: tight per-IP cap to blunt spam/abuse of the public endpoint.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages, please try again later." },
});
// Billing: every hit reaches the Stripe API and can create Customers/Checkout/
// Portal sessions. Cap per-IP so a compromised or scripted client can't spin up
// runaway Stripe objects or hammer the API. Generous enough for real use.
const billingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many billing requests, please slow down." },
});
// Skip the webhook (Stripe has its own signature auth + retry semantics) and
// the health check (uptime monitors poll it frequently and must never be 429'd).
app.use("/api", (req, res, next) => {
  if (req.originalUrl === "/api/webhooks/stripe") return next();
  if (req.originalUrl === "/api/health") return next();
  return apiLimiter(req, res, next);
});

// --- Database Connection Pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connected to MariaDB/MySQL database via Pool!");
    conn.release();
  })
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// Health check for uptime monitoring / load balancers. Pings the DB so a 200
// means the app can actually serve — a DB outage returns 503. Unauthenticated
// and exempt from the rate limiter (see the /api skip above).
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", uptime: Math.round(process.uptime()), ts: new Date().toISOString() });
  } catch (err) {
    console.error("[HEALTH] DB ping failed:", err.message);
    res.status(503).json({ status: "degraded", error: "database" });
  }
});

// =======================
// AUTH ROUTES
// =======================

// Generate base handle from name
const generateHandleFromName = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "") // remove spaces
    .replace(/[^a-z0-9]/g, ""); // remove special chars
};

// Ensure handle is unique in DB
const generateUniqueHandle = async (baseHandle) => {
  let handle = baseHandle;
  let count = 0;

  while (true) {
    const [rows] = await pool.query(
      "SELECT id FROM profiles WHERE handle = ?",
      [handle]
    );
    if (rows.length === 0) return handle;
    count++;
    handle = `${baseHandle}${count}`;
  }
};

// ─── Email verification ──────────────────────────────────────────────────────
const APP_URL = process.env.FRONTEND_URL || "https://mvp.influ-link.com";
const API_URL = process.env.API_PUBLIC_URL || "https://api.influ-link.com";
const EMAIL_VERIFY_TTL_HOURS = 24;

// Idempotent migration. On FIRST creation of the column we grandfather every
// existing account in as verified — otherwise the new login gate would lock out
// everyone who registered before this feature. New rows default to 0.
async function ensureEmailVerificationSchema() {
  const [cols] = await pool.query(
    `SELECT COUNT(*) AS c FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email_verified'`
  );
  if (cols[0].c > 0) return;
  await pool.query(`ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL`);
  await pool.query(`ALTER TABLE users ADD COLUMN email_verification_expires DATETIME NULL`);
  await pool.query(`UPDATE users SET email_verified = 1`); // grandfather existing users
  console.log("[MIGRATION] email verification columns added; existing users grandfathered as verified.");
}

// The raw token only ever lives in the email link; we store its SHA-256 hash.
const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

// Mint a fresh token for a user (used by resend). Returns the RAW token.
async function issueVerificationToken(userId) {
  const raw = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000);
  await pool.query(
    "UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?",
    [hashToken(raw), expires, userId]
  );
  return raw;
}

async function sendVerificationEmail(email, name, rawToken) {
  // Link points at the FRONTEND; the /email-verification page calls the API to
  // confirm. (Path is /email-verification, not /verify-email, because the host
  // intercepts the latter before it reaches the SPA router.)
  const link = `${APP_URL}/email-verification?token=${rawToken}`;
  const subject = "Verify your InfluLink email";
  const text =
    `Hi${name ? " " + name : ""},\n\n` +
    `Confirm your email address to activate your InfluLink account:\n${link}\n\n` +
    `This link expires in ${EMAIL_VERIFY_TTL_HOURS} hours. If you didn't sign up, you can safely ignore this email.`;
  const html = `
    <div style="font-family:Rubik,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#2b2b2b">
      <h2 style="margin:0 0 8px">Verify your email</h2>
      <p style="color:#555;line-height:1.6">Hi${name ? " " + name : ""}, confirm your email address to activate your InfluLink account.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#1E88E5,#6EC5E9);color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600">Verify my email</a>
      </p>
      <p style="color:#888;font-size:13px;line-height:1.6">Or paste this link into your browser:<br><a href="${link}" style="color:#1E88E5;word-break:break-all">${link}</a></p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">This link expires in ${EMAIL_VERIFY_TTL_HOURS} hours. If you didn't sign up, you can ignore this email.</p>
    </div>`;
  await sendEmail({ to: email, subject, text, html });
}

app.post("/api/register", authLimiter, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let {
      name, email, password, accountType,
      analytics, marketing,
      handle, location, bio,
      niche, platforms, languages, content_types, collab_types
    } = req.body;

    // Honeypot: silently reject obvious bots (a hidden form field was filled,
    // or the form was submitted implausibly fast).
    if (isHoneypotTripped(req.body) || isSubmittedTooFast(req.body)) {
      await connection.rollback();
      logSecurityEvent("honeypot_register", req, { email });
      return res.status(400).json({ message: "Invalid submission" });
    }

    // 1. Initial Validation: Password is NOT here yet
    if (!email || !handle || !accountType) {
      return res.status(400).json({ message: "Missing required registration fields" });
    }

    // Whitelist accountType to exactly these two values. Critical: this field is
    // stored, carried in the JWT, and referenced by later queries — an
    // unvalidated value here is a second-order injection / logic-bypass vector.
    if (accountType !== "creator" && accountType !== "brand") {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Brand signups are closed until launch. The frontend hides the option, but
    // gate the API too so brand accounts can't be created out-of-band while
    // BRANDS_ENABLED is off. (The finally below releases the connection.)
    if (accountType === "brand" && !BRANDS_ENABLED) {
      await connection.rollback();
      return res.status(403).json({ message: "Brand registration isn't open yet." });
    }

    const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim();

    // 2. Check if user exists (Google users will exist, new users won't)
    const [existingUsers] = await connection.query(
      `SELECT id, email, password_hash, google_id FROM users WHERE email = ?`, [email]
    );

    const userExists = existingUsers.length > 0;
    const isGoogleUser = userExists && existingUsers[0].google_id !== null;

    // --- CRITICAL CHANGE: Password Validation ---
    // If it's a new user (not Google), they MUST have a password.
    if (!userExists && !password) {
      return res.status(400).json({ message: "Password is required for email registration" });
    }

    // Password strength policy (item #5). Only enforced when a password is
    // actually being set (email signups, or a Google user adding a password).
    if (password) {
      const pwError = validatePassword(password);
      if (pwError) {
        await connection.rollback();
        return res.status(400).json({ message: pwError });
      }
    }

    // 3. Check if handle is taken by SOMEONE ELSE
    const [handleCheck] = await connection.query(
      `SELECT id FROM profiles WHERE handle = ?`, [cleanHandle]
    );

    const isHandleTaken = handleCheck.length > 0 && (!userExists || handleCheck[0].id !== existingUsers[0].id);

    if (isHandleTaken) {
      return res.status(409).json({ message: "Handle is already taken" });
    }

    let userId;
    let rawToken = null; // set for new email signups (email verification)
    // Only hash if a password was provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (userExists) {
      // --- UPDATE EXISTING (GOOGLE) USER ---
      userId = existingUsers[0].id;
      await connection.query(
        `UPDATE users SET 
          name = ?, 
          password_hash = COALESCE(?, password_hash), 
          account_type = ?, 
          consent_analytics = ?, 
          consent_marketing = ?, 
          consent_date = NOW() 
         WHERE id = ?`,
        [name, hashedPassword, accountType, analytics ? 1 : 0, marketing ? 1 : 0, userId]
      );
    } else {
      // --- INSERT NEW STANDARD USER ---
      const [userResult] = await connection.query(
        `INSERT INTO users 
        (name, email, password_hash, account_type, created_at, gdpr_consent, consent_analytics, consent_marketing, consent_date) 
        VALUES (?, ?, ?, ?, NOW(), 1, ?, ?, NOW())`,
        [name, email, hashedPassword, accountType, analytics ? 1 : 0, marketing ? 1 : 0]
      );
      userId = userResult.insertId;
    }

    // New email signups: store a verification token (the raw token is emailed
    // after commit). Google users are already verified, so skip them.
    if (!userExists) {
      rawToken = crypto.randomBytes(32).toString("hex");
      const verifyExpires = new Date(Date.now() + EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000);
      await connection.query(
        "UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?",
        [hashToken(rawToken), verifyExpires, userId]
      );
    }

    // 4. UPSERT PROFILE (Same logic as before, now safe)
    const profileData = accountType === 'creator' ? [
      userId, name, cleanHandle, 'creator', location || null, niche || null, bio || null,
      JSON.stringify(platforms || []), JSON.stringify(languages || []),
      JSON.stringify(content_types || []), JSON.stringify(collab_types || [])
    ] : [
      userId, name, cleanHandle, 'brand', location || null, null, bio || null,
      JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify([])
    ];

    await connection.query(
      `INSERT INTO profiles 
        (id, name, handle, type, location, niche, bio, platforms, languages, content_types, collab_types, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
        name=VALUES(name), handle=VALUES(handle), location=VALUES(location), 
        niche=VALUES(niche), bio=VALUES(bio), platforms=VALUES(platforms), 
        languages=VALUES(languages), content_types=VALUES(content_types), collab_types=VALUES(collab_types)`,
      profileData
    );

    await connection.commit();

    // New email signups must verify before they get a session. Send the link and
    // return WITHOUT setting the auth cookie — the frontend shows "check your email".
    if (!userExists) {
      try {
        await sendVerificationEmail(email, name, rawToken);
      } catch (mailErr) {
        console.error("[VERIFY] Failed to send verification email:", mailErr);
      }
      return res.status(201).json({
        message: "Account created. Please check your email to verify your address.",
        requiresVerification: true,
        email,
      });
    }

    // Existing (Google) user completing registration — already verified, log in.
    const token = jwt.sign({ id: userId, email, accountType }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      domain: '.influ-link.com',
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Profile updated",
      token,
      user: { id: userId, email, username: cleanHandle, accountType, isVIP: false },
    });

  } catch (err) {
    await connection.rollback();
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    connection.release();
  }
});
// Login
app.post("/api/login", authLimiter, validateLoginBody, async (req, res) => {
  // Honeypot: reject obvious bots before touching the DB (hidden field filled
  // or the form submitted implausibly fast).
  if (isHoneypotTripped(req.body) || isSubmittedTooFast(req.body)) {
    logSecurityEvent("honeypot_login", req);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { email, password, analytics, marketing } = req.validated;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      logSecurityEvent("login_failed", req, { email, reason: "no_user" });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      logSecurityEvent("login_failed", req, { email, reason: "bad_password" });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Email must be verified before login. Google users are always verified;
    // pre-existing accounts were grandfathered in by the migration.
    if (!user.email_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, accountType: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (analytics !== undefined || marketing !== undefined) {
      await pool.query(
        "UPDATE users SET gdpr_consent = 1, consent_analytics = ?, consent_marketing = ?, consent_date = NOW() WHERE id = ?",
        [analytics ? 1 : 0, marketing ? 1 : 0, user.id]
      );
    }

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      domain: '.influ-link.com',
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        accountType: user.account_type
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Confirm an email token. Called by the frontend /verify-email page (the email
// link points there), so this returns JSON rather than redirecting.
app.post("/api/auth/verify-email", authLimiter, async (req, res) => {
  const raw = req.body?.token;
  if (!raw || typeof raw !== "string") return res.json({ status: "invalid" });

  try {
    const [rows] = await pool.query(
      "SELECT id, email_verification_expires FROM users WHERE email_verification_token = ? LIMIT 1",
      [hashToken(raw)]
    );
    if (rows.length === 0) return res.json({ status: "invalid" });

    const user = rows[0];
    if (!user.email_verification_expires || new Date(user.email_verification_expires) < new Date()) {
      return res.json({ status: "expired" });
    }

    await pool.query(
      "UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?",
      [user.id]
    );

    return res.json({ status: "success" });
  } catch (err) {
    console.error("[VERIFY] error:", err);
    return res.json({ status: "error" });
  }
});

// Resend the verification link. Always responds the same way so it can't be used
// to probe which emails have accounts.
app.post("/api/auth/resend-verification", authLimiter, async (req, res) => {
  const { email } = req.body || {};
  const generic = { message: "If that email still needs verification, we've sent a new link." };
  if (!email || typeof email !== "string") return res.json(generic);

  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM users WHERE email = ? AND email_verified = 0 AND google_id IS NULL LIMIT 1",
      [email]
    );
    if (rows.length > 0) {
      const raw = await issueVerificationToken(rows[0].id);
      try {
        await sendVerificationEmail(email, rows[0].name, raw);
      } catch (mailErr) {
        console.error("[VERIFY] resend send failed:", mailErr);
      }
    }
    return res.json(generic);
  } catch (err) {
    console.error("[VERIFY] resend error:", err);
    return res.json(generic);
  }
});

// Middleware to verify JWT from cookie
const authenticate = (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

io.use((socket, next) => {
  // Проверяваме на две места: auth обекта И headers (някои клиенти го пращат там)
  const token = socket.handshake.auth?.token ||
    socket.handshake.headers?.['authorization']?.split(' ')[1] ||
    parseCookie(socket.handshake.headers?.cookie); // Твоята функция за бисквитки

  if (!token) {
    console.log("❌ Socket Auth: No token found in handshake");
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Socket Auth: JWT Verification failed", err.message);
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    next();
  });
});

// Помощна функция, ако се наложи:
function parseCookie(cookieStr) {
  return cookieStr?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
}

io.on("connection", (socket) => {
  const userId = socket.user.id;
  console.log(`👤 User connected: ${userId}`);

  socket.join(`user_${userId}`);

  socket.on("disconnect", () => {
    console.log(`👋 User disconnected: ${userId}`);
  });
});

app.set('socketio', io); // Закачи я към express app-а за лесен достъп

export const emitNotification = (userId, data) => {
  if (io) {
    io.to(`user_${userId}`).emit("notification_received", data);
  } else {
    console.error("Socket.io (io) is not initialized yet!");
  }
};

app.post("/api/auth/logout", (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    domain: '.influ-link.com',
    sameSite: "none",
    path: "/",
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("google_exchange_token", cookieOptions);

  res.status(200).json({ message: "Logged out successfully" });
});

// =======================
// PROFILE ROUTES
// =======================
const formatNumberShort = (num) => {
  // Ensure num is a number
  const n = Number(num) || 0;

  // Numbers below 1,000 are returned as-is (e.g., 999)
  if (n < 1000) {
    return n.toString();
  }

  // Thousands (K)
  if (n >= 1000 && n < 1000000) {
    // Divide by 1000 and round to 1 decimal place if needed
    const val = n / 1000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K";
  }

  // Millions (M)
  if (n >= 1000000) {
    // Divide by 1,000,000 and round to 1 decimal place
    const val = n / 1000000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "M";
  }
};

// Get profile (UPDATED: Added isFollowing status)
app.get("/api/profiles/:profileId", authenticate, async (req, res) => {
  try {
    const { profileId } = req.params;
    const currentUserId = req.user.id;

    // This subquery checks if the profile owner has a record in instagram_accounts
    const baseQuery = `
  SELECT p.*, 
  (SELECT COUNT(*) 
   FROM instagram_accounts ia 
   JOIN users u ON ia.user_id = u.id 
   WHERE u.id = p.id) > 0 AS instagram_linked,
  u.stripe_onboarding_complete                          
  FROM profiles p
  JOIN users u ON u.id = p.id
`;

    let rows;
    if (!isNaN(Number(profileId))) {
      [rows] = await pool.query(`${baseQuery} WHERE p.id = ?`, [profileId]);
    } else {
      const cleanedHandle = profileId.startsWith("@") ? profileId.substring(1) : profileId;
      [rows] = await pool.query(`${baseQuery} WHERE p.handle = ?`, [cleanedHandle]);
    }

    if (rows.length === 0) return res.status(404).json({ message: "Profile not found" });

    const profile = rows[0];

    // Check if the current logged-in user follows this profile
    const [followStatus] = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM user_follows WHERE follower_user_id = ? AND following_profile_id = ?) AS isFollowing",
      [currentUserId, profile.id]
    );
    const isFollowing = followStatus[0].isFollowing === 1;

    // Format the response for the frontend
    const formattedProfile = {
      id: profile.id.toString(),
      name: profile.name,
      handle: profile.handle,
      type: profile.type,
      niche: profile.niche,
      location: profile.location,
      verified: profile.verified === 1,
      stripeOnboardingComplete: Boolean(profile.stripe_onboarding_complete),
      bio: profile.bio,
      avatar: profile.avatar,
      isVIP: profile.isVIP === 1,
      isFollowing: isFollowing,
      stats: {
        followers: Number(profile.followers || 0),
        following: Number(profile.following || 0),
        engagementRate: Number(profile.engagement_rate || 0),
        totalReach: Number(profile.total_reach || 0),
        // THIS is the key that makes the button stay "Connected"
        instagramLinked: Boolean(profile.instagram_linked),
      },
      platforms: JSON.parse(profile.platforms || "[]"),
      contentTypes: JSON.parse(profile.content_types || "[]"),
      collabTypes: JSON.parse(profile.collab_types || "[]"),
      socialLinks: typeof profile.social_links === 'string'
        ? JSON.parse(profile.social_links || "{}")
        : (profile.social_links || {}),
    };

    res.json(formattedProfile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});

// Toggle follow
app.post("/api/profiles/:profileId/follow", authenticate, async (req, res) => {
  const { profileId } = req.params;
  const followerId = req.user.id;

  if (String(followerId) === profileId) {
    return res.status(400).json({ message: "Cannot follow your own profile" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Check if the user is already following the profile
    const [existingFollow] = await connection.query(
      "SELECT * FROM user_follows WHERE follower_user_id = ? AND following_profile_id = ?",
      [followerId, profileId]
    );

    const isCurrentlyFollowing = existingFollow.length > 0;
    let message;

    if (isCurrentlyFollowing) {
      // UNFOLLOW
      await connection.query(
        "DELETE FROM user_follows WHERE follower_user_id = ? AND following_profile_id = ?",
        [followerId, profileId]
      );
      // Decrement profile's follower count
      await connection.query(
        "UPDATE profiles SET followers = GREATEST(followers - 1, 0) WHERE id = ?",
        [profileId]
      );
      message = "Unfollowed successfully";
    } else {
      // FOLLOW
      await connection.query(
        "INSERT INTO user_follows (follower_user_id, following_profile_id) VALUES (?, ?)",
        [followerId, profileId]
      );
      // Increment profile's follower count
      await connection.query(
        "UPDATE profiles SET followers = followers + 1 WHERE id = ?",
        [profileId]
      );
      message = "Followed successfully";
    }

    // Get the updated count for the response
    const [updatedProfile] = await connection.query(
      "SELECT followers FROM profiles WHERE id = ?",
      [profileId]
    );

    await connection.commit();

    res.json({
      message: message,
      isFollowing: !isCurrentlyFollowing, // Send the new status
      followers: updatedProfile[0].followers, // Send the new count
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error toggling follow:", err);
    res.status(500).json({ message: "Failed to update follow status" });
  } finally {
    if (connection) connection.release();
  }
});

// Get portfolio
app.get("/api/profiles/:profileId/portfolio", authenticate, async (req, res) => {
  const { profileId } = req.params;
  const currentUserId = req.user.id; // From your auth middleware

  try {
    // We check the portfolio_likes table to see if a record exists for this user
    const [rows] = await pool.query(
      `SELECT p.*, 
       IF(pl.user_id IS NULL, 0, 1) as has_liked
       FROM portfolio p
       LEFT JOIN portfolio_likes pl ON p.id = pl.portfolio_id AND pl.user_id = ?
       WHERE p.profile_id = ? 
       ORDER BY p.id DESC`,
      [currentUserId, profileId]
    );

    const formatted = rows.map((item) => ({
      id: item.id.toString(),
      profileId: item.profile_id.toString(),
      title: item.title,
      brand: item.brand,
      type: item.type,
      description: item.description,
      image: item.image,
      createdAt: item.created_at,
      hasLiked: Boolean(item.has_liked), // True if user already liked it
      stats: {
        likes: item.likes || 0,
        views: item.views || 0,
      },
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});

// 2. Like a post
app.post("/api/profiles/:profileId/portfolio/:postId/like", authenticate, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Insert record into junction table; ignore if already exists (prevent double-like)
    const [result] = await pool.query(
      "INSERT IGNORE INTO portfolio_likes (user_id, portfolio_id) VALUES (?, ?)",
      [userId, postId]
    );

    // If a new row was actually inserted, increment the main counter
    if (result.affectedRows > 0) {
      await pool.query("UPDATE portfolio SET likes = likes + 1 WHERE id = ?", [postId]);
    }

    const [updated] = await pool.query("SELECT likes FROM portfolio WHERE id = ?", [postId]);
    res.json({ likes: updated[0].likes, hasLiked: true });
  } catch (err) {
    res.status(500).json({ message: "Error liking post" });
  }
});

// 3. Unlike a post
app.delete("/api/profiles/:profileId/portfolio/:postId/like", authenticate, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM portfolio_likes WHERE user_id = ? AND portfolio_id = ?",
      [userId, postId]
    );

    if (result.affectedRows > 0) {
      await pool.query("UPDATE portfolio SET likes = GREATEST(likes - 1, 0) WHERE id = ?", [postId]);
    }

    const [updated] = await pool.query("SELECT likes FROM portfolio WHERE id = ?", [postId]);
    res.json({ likes: updated[0].likes, hasLiked: false });
  } catch (err) {
    res.status(500).json({ message: "Error unliking post" });
  }
});

// Add portfolio post
app.post(
  "/api/profiles/:profileId/portfolio",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    const { profileId } = req.params;
    const { title, brand, type, description } = req.body;

    try {
      // Ownership: a user may only add posts to their own profile.
      if (String(profileId) !== String(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imagePath = `/uploads/${req.file.filename}`;
      const defaultStats = { likes: 0, views: 0 };

      const [result] = await pool.query(
        `INSERT INTO portfolio 
         (profile_id, title, brand, type, image, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [profileId, title, brand, type, imagePath, description]
      );

      res.status(201).json({
        id: result.insertId.toString(),
        title,
        brand,
        type,
        description,
        image: imagePath,
        stats: defaultStats,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error adding portfolio post:", err);
      res.status(500).json({ message: "Failed to add portfolio post" });
    }
  }
);

// Delete portfolio post
app.delete(
  "/api/profiles/:profileId/portfolio/:postId",
  authenticate,
  async (req, res) => {
    const { postId } = req.params;
    try {
      // Ownership: bind the delete to the authenticated user's profile, not a
      // URL-supplied profileId.
      const [result] = await pool.query(
        "DELETE FROM portfolio WHERE id = ? AND profile_id = ?",
        [postId, req.user.id]
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Post not found or unauthorized" });
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting portfolio post:", err);
      res.status(500).json({ message: "Failed to delete post" });
    }
  }
);

// Get analytics
app.get("/api/profiles/:profileId/analytics", authenticate, async (req, res) => {
  const { profileId } = req.params;

  try {
    // 1. Вземаме исторически данни за последните 14 дни (за графиките)
    const [historyRows] = await pool.query(
      `SELECT date, views, likes, reach 
       FROM daily_stats 
       WHERE profile_id = ? 
       ORDER BY date ASC LIMIT 14`,
      [profileId]
    );

    // 2. Вземаме общите суми от портфолиото за главните метрики
    const [portfolioTotals] = await pool.query(
      "SELECT SUM(likes) AS totalLikes, SUM(views) AS totalViews FROM portfolio WHERE profile_id = ?",
      [profileId]
    );

    const totalLikes = Number(portfolioTotals[0].totalLikes || 0);
    const totalViews = Number(portfolioTotals[0].totalViews || 0);

    // 3. Вземаме топ 5 най-ангажиращи поста
    const [topPostsRows] = await pool.query(
      `SELECT id, title, (likes + views) as engagement 
       FROM portfolio 
       WHERE profile_id = ? 
       ORDER BY engagement DESC LIMIT 5`,
      [profileId]
    );

    // 4. Форматиране на данните за Recharts (Engagement Over Time)
    const engagementOverTime = historyRows.map(row => ({
      date: new Date(row.date).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' }),
      value: row.views > 0 ? Number(((row.likes / row.views) * 100).toFixed(1)) : 0
    }));

    // 5. Форматиране за Reach Trend графиката
    const reachTrend = historyRows.map(row => ({
      date: new Date(row.date).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' }),
      reach: row.reach
    }));

    // 6. Форматиране на топ постовете
    const topPerformingPosts = topPostsRows.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      engagement: Number(post.engagement),
    }));

    // 7. Подготовка на финалния обект (съвпада с Frontend-а)
    const analyticsData = {
      totalLikes: totalLikes.toString(),
      totalViews: totalViews.toString(),
      engagementOverTime, // [{date, value}, ...]
      reachTrend,         // [{date, reach}, ...]
      viewsByPlatform: [
        { platform: "Mobile", views: Math.round(totalViews * 0.82) },
        { platform: "Desktop", views: Math.round(totalViews * 0.18) }
      ],
      topPerformingPosts,
      newFollowersCount: 0 // Може да се добави по-късно при нужда
    };

    res.json(analyticsData);
  } catch (err) {
    console.error("❌ Analytics Route Error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

app.post(
  "/api/profiles/me/avatar",
  authenticate,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const avatarPath = `/uploads/${req.file.filename}`; // path to save in DB

      await pool.query("UPDATE profiles SET avatar = ? WHERE id = ?", [
        avatarPath,
        req.user.id,
      ]);

      // Return updated profile
      const [rows] = await pool.query("SELECT * FROM profiles WHERE id = ?", [
        req.user.id,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ message: "Profile not found" });

      res.json({ ...rows[0], avatar: avatarPath });
    } catch (err) {
      console.error("Error updating avatar:", err);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  }
);

const analyticsBuffer = {}; // { [profileId]: { views: number, likes: number } }

function bufferAnalytics(profileId, type = "views", amount = 1) {
  if (!analyticsBuffer[profileId])
    analyticsBuffer[profileId] = { views: 0, likes: 0 };
  analyticsBuffer[profileId][type] += amount;
}

const postViewsBuffer = {};
// { [postId]: number of pending views }

function bufferPostView(postId, amount = 1) {
  if (!postViewsBuffer[postId]) postViewsBuffer[postId] = 0;
  postViewsBuffer[postId] += amount;
}

setInterval(async () => {
  const analyticsEntries = Object.entries(analyticsBuffer);
  const postEntries = Object.entries(postViewsBuffer);

  if (analyticsEntries.length === 0 && postEntries.length === 0) return;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // --- 1. Flush post views ---
    for (const [postId, pendingViews] of postEntries) {
      await connection.query(
        "UPDATE portfolio SET views = views + ? WHERE id = ?",
        [pendingViews, postId]
      );
    }

    // --- 2. Flush profile analytics (reach + engagement rate) ---
    for (const [profileId, { views, likes }] of analyticsEntries) {
      await connection.query(
        `INSERT INTO daily_stats (profile_id, date, views, likes, reach) 
         VALUES (?, CURDATE(), ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         views = views + VALUES(views), 
         likes = likes + VALUES(likes), 
         reach = reach + VALUES(reach)`,
        [profileId, views, likes, views + likes]
      );

      const reachIncrement = views + likes;
      await connection.query(
        "UPDATE profiles SET total_reach = total_reach + ? WHERE id = ?",
        [reachIncrement, profileId]
      );

      const [totalsRows] = await connection.query(
        "SELECT SUM(likes) AS totalLikes, SUM(views) AS totalViews FROM portfolio WHERE profile_id = ?",
        [profileId]
      );

      const totalLikes = Number(totalsRows[0].totalLikes || 0);
      const totalViews = Number(totalsRows[0].totalViews || 0);

      const [followersRows] = await connection.query(
        "SELECT followers FROM profiles WHERE id = ?",
        [profileId]
      );
      const followersCount = Number(followersRows[0]?.followers || 0);

      let rawRate =
        followersCount > 0 ? (totalLikes + totalViews) / followersCount : 0;
      if (followersCount < 50) rawRate *= 0.5;
      const engagementRatePercent = Math.min(rawRate * 100, 100).toFixed(1);

      await connection.query(
        "UPDATE profiles SET engagement_rate = ? WHERE id = ?",
        [engagementRatePercent, profileId]
      );
    }

    await connection.commit();

    // Clear buffers
    analyticsEntries.forEach(
      ([profileId]) => delete analyticsBuffer[profileId]
    );
    postEntries.forEach(([postId]) => delete postViewsBuffer[postId]);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Batch update failed", err);
  } finally {
    if (connection) connection.release();
  }
}, 60_000); // every 60s

// Increment views and update engagement rate
app.post(
  "/api/profiles/:profileId/portfolio/:postId/view",
  authenticate,
  async (req, res) => {
    const { profileId, postId } = req.params;
    try {
      // 1. Buffer profile analytics (reach)
      bufferAnalytics(profileId, "views", 1);

      // 2. Buffer post views
      bufferPostView(postId, 1);

      res.json({ message: "View recorded (buffered)" });
    } catch (err) {
      console.error("Error recording view:", err);
      res.status(500).json({ message: "Failed to record view" });
    }
  }
);

const FOLLOWER_RANGES = {
  nano: { min: 0, max: 10_000 },
  micro: { min: 10_001, max: 100_000 },
  mid: { min: 100_001, max: 500_000 },
  macro: { min: 500_001, max: 1_000_000 },
  mega: { min: 1_000_001, max: null }, // no upper limit
};

// =======================
// CREATOR SEARCH ROUTE
// =======================
app.post("/api/creators/search", authenticate, async (req, res) => {
  try {
    const {
      query = "",
      niches = [], // Changed from niche to niches to match your frontend object
      country = "",
      languages = [],
      platforms = [],
      minFollowers = 0,
      maxFollowers = 10000000,
      isVIP = false,
      availableNow = false,
      page = 1,
      limit = 12,
      minEngagement,
      maxEngagement,
      contentTypes = [],
      collabTypes = [],
      budgetRange = "any",
      sortBy = 'followers' // Extracted from request
    } = req.body;

    const where = [];
    const params = [];

    where.push(`type = 'creator'`);

    // 🔍 Text search
    if (query.trim()) {
      where.push(`(
        name LIKE ? OR 
        handle LIKE ? OR 
        bio LIKE ? OR 
        niche LIKE ? OR 
        location LIKE ? OR 
        country LIKE ? OR 
        JSON_SEARCH(collab_types, 'one', ?) IS NOT NULL OR 
        JSON_SEARCH(content_types, 'one', ?) IS NOT NULL
      )`);
      const q = `%${query}%`;
      params.push(q, q, q, q, q, q, q, q);
    }

    const sortMap = {
      followers: 'followers DESC',
      engagement: 'engagement_rate DESC',
      name: 'name ASC',
      recent: 'id DESC'
    };

    const orderBy = sortMap[sortBy] || 'followers DESC';

    // Niche
    if (niches.length > 0) {
      where.push(`niche IN (${niches.map(() => "?").join(",")})`);
      params.push(...niches);
    }

    // Country
    if (country?.length) {
      const placeholders = country.map(() =>
        "(country = ? OR location = ? OR location LIKE ? OR location LIKE ?)"
      ).join(" OR ");
      where.push(`(${placeholders})`);
      country.forEach(c => params.push(c, c, `${c},%`, `%, ${c}`));
    }

    // Availability & VIP
    if (availableNow) where.push(`available_now = 1`);
    if (isVIP) where.push(`isVip = 1`);

    const activeLanguages = Array.isArray(languages) ? languages : [];
    // Language
    if (Array.isArray(languages) && languages.length > 0) {
      const orClauses = languages
        .map(() => `(
        languages IS NOT NULL 
        AND JSON_VALID(languages) 
        AND JSON_SEARCH(LOWER(languages), 'one', LOWER(?)) IS NOT NULL
    )`)
        .join(" OR ");

      where.push(`(${orClauses})`);
      params.push(...languages);
    }

    // Platforms
    if (platforms && platforms.length > 0) {
      const platformConditions = [];

      // Whitelist of supported platform keys → their canonical social_links JSON key.
      // Never interpolate user input into the JSON path; map to a known key instead
      // and pass it as a bound parameter.
      const PLATFORM_KEYS = {
        instagram: "Instagram",
        facebook: "Facebook",
        x: "X",
        twitter: "X",
        linkedin: "LinkedIn",
        youtube: "YouTube",
        tiktok: "TikTok",
      };

      platforms.forEach((p) => {
        const canonical = PLATFORM_KEYS[String(p).toLowerCase()];
        if (!canonical) return; // ignore unknown platforms

        platformConditions.push(`(
      JSON_EXTRACT(social_links, ?) IS NOT NULL
      AND JSON_EXTRACT(social_links, ?) != '""'
    )`);
        const jsonPath = `$.${canonical}`;
        params.push(jsonPath, jsonPath);

        if (canonical === "Instagram") {
          platformConditions.push("instagram_linked = 1");
        }
      });

      if (platformConditions.length > 0) {
        where.push(`(${platformConditions.join(" OR ")})`);
      }
    }

    // Stats Ranges
    where.push(`followers >= ? AND followers <= ?`);
    params.push(minFollowers ?? 0, maxFollowers ?? 10000000);

    where.push(`engagement_rate >= ? AND engagement_rate <= ?`);
    params.push(minEngagement ?? 0, maxEngagement ?? 100);

    // 💰 Budget Range Filter (NEW)
    if (budgetRange && budgetRange !== 'any') {
      let minB = 0;
      let maxB = 9999999;

      if (budgetRange === "under_100") {
        maxB = 100;
      } else if (budgetRange === "100_500") {
        minB = 100;
        maxB = 500;
      } else if (budgetRange === "500_1k") {
        minB = 500;
        maxB = 1000;
      } else if (budgetRange === "1k_plus") {
        minB = 1000;
      }

      // Filter creators where their minimum budget starts within this range
      where.push(`budget_min >= ? AND budget_min <= ?`);
      params.push(minB, maxB);
    }

    // Content & Collab Types
    if (contentTypes.length > 0) {
      const orClauses = contentTypes.map(() => `JSON_CONTAINS(content_types, ?)`).join(" OR ");
      where.push(`(${orClauses})`);
      params.push(...contentTypes.map((t) => `"${t}"`));
    }

    if (collabTypes.length > 0) {
      const orClauses = collabTypes.map(() => `JSON_CONTAINS(collab_types, ?)`).join(" OR ");
      where.push(`(${orClauses})`);
      params.push(...collabTypes.map((t) => `"${t}"`));
    }

    // 2. GET TOTAL COUNT
    const countSql = `SELECT COUNT(*) as total FROM profiles WHERE ${where.join(" AND ")}`;
    const [countResult] = await pool.query(countSql, params);
    const totalCount = countResult[0].total;

    // 3. GET PAGINATED DATA
    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT id, name, handle, niche, location, avatar, followers, 
             engagement_rate, social_links, isVIP, budget_min, budget_max, 
             country, languages, platforms, content_types, collab_types
      FROM profiles
      WHERE ${where.join(" AND ")}
      ORDER BY isVIP DESC, ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, Number(limit), Number(offset)]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      count: totalCount,
      results: rows,
    });

  } catch (err) {
    console.error("Creator search error:", err);
    res.status(500).json({ message: "Failed to search creators" });
  }
});

// =======================
// UPDATE PROFILE ROUTE
// =======================
app.post("/api/profiles/me/update", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. ADDED socialLinks to destructuring
    let { name, bio, niche, location, socialLinks } = req.body;

    const [rows] = await pool.query("SELECT * FROM profiles WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "Profile not found" });

    const currentProfile = rows[0];

    if (!name || name.trim() === "") {
      name = currentProfile.name;
    }

    bio = bio ?? currentProfile.bio;
    niche = niche ?? currentProfile.niche;
    location = location ?? currentProfile.location;

    // 2. Fallback to current social links if not provided in request
    // We stringify it because MySQL JSON columns expect a string or a JSON object
    const finalSocialLinks = socialLinks ? JSON.stringify(socialLinks) : currentProfile.social_links;

    let handle = currentProfile.handle;
    if (name !== currentProfile.name) {
      const baseHandle = generateHandleFromName(name);
      handle = await generateUniqueHandle(baseHandle);
    }

    // 3. UPDATED Query to include social_links
    await pool.query(
      `UPDATE profiles 
       SET name = ?, bio = ?, niche = ?, location = ?, handle = ?, social_links = ?
       WHERE id = ?`,
      [name, bio, niche, location, handle, finalSocialLinks, userId]
    );

    const [updatedRows] = await pool.query("SELECT * FROM profiles WHERE id = ?", [userId]);
    const profile = updatedRows[0];

    res.json({
      message: "Profile updated successfully",
      profile: {
        id: profile.id,
        name: profile.name,
        handle: profile.handle,
        bio: profile.bio,
        niche: profile.niche,
        location: profile.location,
        avatar: profile.avatar,
        type: profile.type,
        isVIP: profile.isVIP,
        followers: profile.followers,
        following: profile.following,
        // 4. ADDED to response so frontend state updates immediately
        socialLinks: typeof profile.social_links === 'string'
          ? JSON.parse(profile.social_links)
          : profile.social_links,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// =======================
// CREATOR PLANS (RATE CARD)
// =======================
//
// Creator-defined, fixed-price packages shown on the profile — e.g.
// "Starter · 1 Reel + 3 Stories · €300". Display-only by design: a brand reads
// the rate card and starts a conversation. Nothing here touches money; deals
// still go through the existing campaign/escrow flow (deal_payments), so a plan
// is marketing copy with a number on it, not a payable object.

const MAX_PLANS = 6;
const MAX_PLAN_FEATURES = 6;

// Mirrors src/config/planOptions.ts. Every creator-supplied value below is an
// enum key, not free text, so packages stay comparable across profiles — and so
// nothing user-authored reaches the profile page as prose.
const PLAN_PLATFORMS = ["instagram", "tiktok", "youtube", "x", "facebook"];
const PLAN_TIERS = ["starter", "standard", "growth", "premium", "signature"];
const PLAN_DELIVERABLES = {
  instagram: ["reel", "story", "post", "carousel", "live", "collab"],
  tiktok: ["video", "photo", "live", "spark"],
  youtube: ["video", "short", "integration", "community"],
  x: ["post", "thread", "video"],
  facebook: ["post", "reel", "story", "video"],
};
const PLAN_DELIVERY_DAYS = [1, 2, 3, 5, 7, 10, 14, 21, 30];

const ensureCreatorPlansTable = async () => {
  const body = `
    CREATE TABLE IF NOT EXISTS creator_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      platform VARCHAR(20) NOT NULL DEFAULT 'instagram',
      title VARCHAR(80) NOT NULL,
      description VARCHAR(400) NULL,
      price DECIMAL(10,2) NOT NULL,
      currency CHAR(3) NOT NULL DEFAULT 'EUR',
      delivery_days INT NULL,
      features JSON NULL,
      is_featured TINYINT(1) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_creator_plans_user (user_id, sort_order)`;
  try {
    await pool.query(
      `${body},
      CONSTRAINT fk_creator_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
    );
  } catch (err) {
    // A type mismatch against users.id would abort the whole CREATE. Having the
    // table matters more than having the constraint, so retry without it.
    console.error("[PLANS] CREATE TABLE with FK failed, retrying without:", err.message);
    // Rethrow if the retry fails too: without the table every plans request
    // 500s, so the startup log must say so instead of printing a tick.
    await pool.query(`${body}\n    )`);
  }

  // `platform` was added after the table shipped, so top it up where the table
  // already exists. Same pattern as ensureEscrowColumns.
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'creator_plans'`,
    [process.env.DB_DATABASE]
  );
  if (!cols.some((c) => c.COLUMN_NAME === "platform")) {
    await pool.query(
      "ALTER TABLE creator_plans ADD COLUMN platform VARCHAR(20) NOT NULL DEFAULT 'instagram' AFTER user_id"
    );
    console.log("[PLANS] Added platform column to creator_plans");
  }
};

// Validate and normalise the client payload. Never trust the body for identity
// or ordering — the owner comes from the session and sort_order from the array.
const parsePlansPayload = (raw) => {
  if (!Array.isArray(raw)) return { error: "plans must be an array" };
  if (raw.length > MAX_PLANS) return { error: `You can publish at most ${MAX_PLANS} plans` };

  const plans = [];
  for (let i = 0; i < raw.length; i++) {
    const p = raw[i];
    const at = `Plan ${i + 1}`;
    if (!p || typeof p !== "object") return { error: `${at} is invalid` };

    const platform = String(p.platform ?? "").trim().toLowerCase();
    if (!PLAN_PLATFORMS.includes(platform)) return { error: `${at}: pick a platform` };

    // `title` holds a tier KEY (starter/growth/…), not prose — the client
    // renders the label from i18n. Kept under the original column name.
    const tier = String(p.title ?? "").trim().toLowerCase();
    if (!PLAN_TIERS.includes(tier)) return { error: `${at}: pick a package type` };

    const description = String(p.description ?? "").trim();
    if (description.length > 400) return { error: `${at}: description is too long (max 400 characters)` };

    const price = Number(p.price);
    if (!Number.isFinite(price) || price < 0) return { error: `${at}: price must be a positive number` };
    if (price > 1000000) return { error: `${at}: price is too high` };

    let deliveryDays = null;
    if (p.deliveryDays !== null && p.deliveryDays !== undefined && p.deliveryDays !== "") {
      deliveryDays = Number(p.deliveryDays);
      if (!PLAN_DELIVERY_DAYS.includes(deliveryDays)) {
        return { error: `${at}: pick a delivery time from the list` };
      }
    }

    // Deliverables are {type, qty} pairs drawn from the chosen platform's list.
    // Stored in the pre-existing `features` JSON column.
    const rawItems = Array.isArray(p.deliverables) ? p.deliverables : [];
    if (rawItems.length > MAX_PLAN_FEATURES) {
      return { error: `${at}: at most ${MAX_PLAN_FEATURES} deliverables` };
    }
    const allowed = PLAN_DELIVERABLES[platform] || [];
    const deliverables = [];
    for (const item of rawItems) {
      if (!item || typeof item !== "object") return { error: `${at}: invalid deliverable` };
      const type = String(item.type ?? "").trim().toLowerCase();
      if (!allowed.includes(type)) {
        return { error: `${at}: "${type}" isn't available on ${platform}` };
      }
      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        return { error: `${at}: quantity must be between 1 and 10` };
      }
      // Collapse duplicates rather than rejecting — two "2 × Reel" rows is a
      // slip, not an attack.
      const existing = deliverables.find((d) => d.type === type);
      if (existing) existing.qty = Math.min(10, existing.qty + qty);
      else deliverables.push({ type, qty });
    }
    if (deliverables.length === 0) return { error: `${at}: add at least one deliverable` };

    plans.push({
      platform,
      title: tier,
      description: description || null,
      price: Math.round(price * 100) / 100,
      deliveryDays,
      deliverables,
      isFeatured: Boolean(p.isFeatured),
    });
  }
  return { plans };
};

const formatPlan = (row) => {
  const raw = Array.isArray(row.features) ? row.features : JSON.parse(row.features || "[]");
  return {
    id: String(row.id),
    platform: row.platform || "instagram",
    title: row.title,
    description: row.description || "",
    price: Number(row.price),
    currency: row.currency || "EUR",
    deliveryDays: row.delivery_days === null ? null : Number(row.delivery_days),
    // Rows written before deliverables were structured hold plain strings
    // ("3 Stories"). Surface them with a null quantity rather than dropping
    // them — an odd-looking line beats a package with no contents.
    deliverables: raw
      .map((d) => {
        if (typeof d === "string") return d.trim() ? { type: d.trim(), qty: null } : null;
        if (d && typeof d === "object") return { type: String(d.type), qty: Number(d.qty) || 1 };
        return null;
      })
      .filter(Boolean),
    isFeatured: Boolean(row.is_featured),
  };
};

// Public (to signed-in users) rate card for a profile, by id or @handle.
app.get("/api/profiles/:profileId/plans", authenticate, async (req, res) => {
  try {
    const { profileId } = req.params;

    let owner;
    if (!isNaN(Number(profileId))) {
      [owner] = await pool.query("SELECT id FROM profiles WHERE id = ?", [profileId]);
    } else {
      const handle = profileId.startsWith("@") ? profileId.substring(1) : profileId;
      [owner] = await pool.query("SELECT id FROM profiles WHERE handle = ?", [handle]);
    }
    if (owner.length === 0) return res.status(404).json({ message: "Profile not found" });

    const [rows] = await pool.query(
      `SELECT id, platform, title, description, price, currency, delivery_days, features, is_featured
       FROM creator_plans WHERE user_id = ? ORDER BY sort_order ASC, id ASC`,
      [owner[0].id]
    );
    res.json(rows.map(formatPlan));
  } catch (err) {
    console.error("Error fetching creator plans:", err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

// Replace the signed-in creator's whole rate card. A full replace (rather than
// per-plan CRUD) keeps ordering and deletions in one atomic write, which is
// what the editor UI produces.
app.put("/api/profiles/me/plans", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [profileRows] = await pool.query("SELECT type FROM profiles WHERE id = ?", [userId]);
    if (profileRows.length === 0) return res.status(404).json({ message: "Profile not found" });
    if (profileRows[0].type !== "creator") {
      return res.status(403).json({ message: "Only creators can publish plans" });
    }

    const { plans, error } = parsePlansPayload(req.body?.plans);
    if (error) return res.status(400).json({ message: error });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query("DELETE FROM creator_plans WHERE user_id = ?", [userId]);
      if (plans.length > 0) {
        await connection.query(
          `INSERT INTO creator_plans
             (user_id, platform, title, description, price, delivery_days, features, is_featured, sort_order)
           VALUES ?`,
          [
            plans.map((p, i) => [
              userId,
              p.platform,
              p.title,
              p.description,
              p.price,
              p.deliveryDays,
              JSON.stringify(p.deliverables),
              p.isFeatured ? 1 : 0,
              i,
            ]),
          ]
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    const [rows] = await pool.query(
      `SELECT id, platform, title, description, price, currency, delivery_days, features, is_featured
       FROM creator_plans WHERE user_id = ? ORDER BY sort_order ASC, id ASC`,
      [userId]
    );
    res.json({ message: "Plans updated", plans: rows.map(formatPlan) });
  } catch (err) {
    console.error("Error updating creator plans:", err);
    res.status(500).json({ message: "Failed to update plans" });
  }
});

// =======================
// BRAND SUBSCRIPTIONS (platform SaaS billing)
// =======================
//
// The pricing-page brand tiers, wired to Stripe Subscriptions. The brand pays
// the PLATFORM a monthly/annual fee — this is unrelated to the creator escrow
// flow above (no Connect, no commission). A subscription's tier decides which
// product features are unlocked; anything above the tier returns 402 so the UI
// can show an upgrade dialog ("what the plan includes and nothing more").
//
// Ships behind BRANDS_ENABLED — brands can't register yet, so this is dark
// until the frontend flag flips. Stripe calls only run with a real key, so a
// local dummy key can't error the boot or touch a live account.

const STRIPE_LIVE = /^sk_(test|live)_/.test(process.env.STRIPE_SECRET_KEY || "");

// Backend kill-switch for brand billing, mirroring the frontend
// `src/config/features.ts` flag. Defaults OFF so the creator side can go live
// (sk_live_) WITHOUT this key minting live brand Products/Prices or exposing the
// /api/billing/* routes. Flip to "true" in the droplet .env when brands launch.
const BRANDS_ENABLED = process.env.BRANDS_ENABLED === "true";

// Gate for the brand-billing routes: while brands are dark, they don't exist.
const requireBrandsEnabled = (req, res, next) =>
  BRANDS_ENABLED ? next() : res.status(404).json({ message: "Not found" });

const BILLING_CURRENCY = "eur";

// Annual plans are billed once a year at a 20% discount (mirrors the pricing
// page's BillingToggle). Kept as a single knob.
const BRAND_ANNUAL_DISCOUNT = 0.8;

// Grace window after a payment fails. Stripe's Smart Retries keep dunning the
// card during this time; we keep access ON so a temporary card hiccup never
// yanks a paying customer out mid-cycle. In normal operation access is revoked
// when Stripe gives up and flips the subscription to `canceled` (its
// "Subscription status → cancel the subscription" setting) — this window is the
// backstop for the odd case where the subscription lingers in `past_due`.
// ► MUST be ≥ Stripe's retry schedule length (Revenue recovery → Retries;
//   currently 14 days) or we'd cut access while Stripe could still recover it.
const BRAND_GRACE_DAYS = 15;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const toMysqlDate = (d) => (d ? new Date(d).toISOString().slice(0, 19).replace("T", " ") : null);

// ⚠️ PLACEHOLDER AMOUNTS — set the real monthly prices (in euro cents) here
// before going live. Amounts are the ONLY source of truth; changing one makes
// ensureBrandPlanCatalog create a fresh Stripe Price on the next boot (Stripe
// prices are immutable), so historic subscribers keep their old price while new
// checkouts use the new one. `rank` drives feature gating; higher unlocks more.
const BRAND_PLANS = {
  essential: { rank: 1, monthlyCents: 1900 },   // TODO real amount
  starter:   { rank: 2, monthlyCents: 4900 },   // TODO real amount
  growth:    { rank: 3, monthlyCents: 9900 },   // TODO real amount
  pro:       { rank: 4, monthlyCents: 19900 },  // TODO real amount
  // Enterprise is contact-sales — no self-serve price, highest rank.
  enterprise: { rank: 5, contact: true },
};

// Feature key → minimum tier that unlocks it. This IS the "nothing more"
// contract: a gated action checks the brand's tier rank against the required
// one. Keep aligned with the pricing page's comparison table. Extend as brand
// features land — the frontend reads this same map via /api/billing/entitlements.
const BRAND_FEATURE_MIN_TIER = {
  "campaigns.create": "essential",
  "creators.search": "essential",
  "analytics.basic": "starter",
  "analytics.advanced": "growth",
  "team.seats": "growth",
  "campaigns.unlimited": "pro",
  "api.access": "pro",
  "support.priority": "pro",
};

const brandTierRank = (tier) => BRAND_PLANS[tier]?.rank || 0;
const isPaidBrandTier = (tier) =>
  Boolean(BRAND_PLANS[tier] && !BRAND_PLANS[tier].contact);

// The amount charged for a (tier, interval). Annual = monthly ×12 ×discount,
// rounded to the cent — so the yearly Price is one integer, as Stripe wants.
const brandPlanAmount = (tier, interval) => {
  const monthly = BRAND_PLANS[tier]?.monthlyCents;
  if (!monthly) return null;
  return interval === "annual"
    ? Math.round(monthly * 12 * BRAND_ANNUAL_DISCOUNT)
    : monthly;
};

const brandLookupKey = (tier, interval) => `brand_${tier}_${interval}`;

// In-memory cache of resolved Stripe Price IDs, keyed by lookup_key. Filled by
// ensureBrandPlanCatalog on boot and consulted at checkout.
const brandPriceCache = new Map();

const ensureBrandBillingSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS brand_subscriptions (
      user_id INT NOT NULL PRIMARY KEY,
      stripe_customer_id VARCHAR(255) NULL,
      stripe_subscription_id VARCHAR(255) NULL,
      plan_tier VARCHAR(20) NULL,
      plan_interval VARCHAR(10) NULL,
      status VARCHAR(30) NULL,
      current_period_end DATETIME NULL,
      cancel_at_period_end TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_brand_subs_customer (stripe_customer_id),
      INDEX idx_brand_subs_subscription (stripe_subscription_id)
    )
  `);
  // `grace_until` added after the table shipped — top it up where it's missing.
  const [subCols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'brand_subscriptions'`,
    [process.env.DB_DATABASE]
  );
  if (!subCols.some((c) => c.COLUMN_NAME === "grace_until")) {
    await pool.query("ALTER TABLE brand_subscriptions ADD COLUMN grace_until DATETIME NULL AFTER current_period_end");
    console.log("[BILLING] Added grace_until column to brand_subscriptions");
  }
  // Resolved catalog so we don't recreate Products/Prices every boot and can
  // detect an amount change (→ mint a new Price).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS billing_catalog (
      lookup_key VARCHAR(64) NOT NULL PRIMARY KEY,
      tier VARCHAR(20) NOT NULL,
      billing_interval VARCHAR(10) NOT NULL,
      amount_cents INT NOT NULL,
      product_id VARCHAR(255) NOT NULL,
      price_id VARCHAR(255) NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

// Create the Stripe Products/Prices for each paid tier, idempotently. Reuses a
// tier's Product across boots and intervals; only mints a new Price when the
// configured amount differs from what's recorded (Prices are immutable). Safe
// to run every boot. No-ops without a real Stripe key.
const ensureBrandPlanCatalog = async () => {
  if (!BRANDS_ENABLED) {
    console.log("[BILLING] Skipping catalog — brands disabled (BRANDS_ENABLED != true).");
    return;
  }
  if (!STRIPE_LIVE) {
    console.log("[BILLING] Skipping catalog — no live Stripe key.");
    return;
  }
  const productByTier = new Map();
  const [rows] = await pool.query("SELECT * FROM billing_catalog");
  const existing = new Map(rows.map((r) => [r.lookup_key, r]));
  for (const r of rows) if (!productByTier.has(r.tier)) productByTier.set(r.tier, r.product_id);

  const ensureProduct = async (tier) => {
    if (productByTier.has(tier)) return productByTier.get(tier);
    const product = await stripe.products.create({
      name: `InfluLink Brand — ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
      metadata: { plan_tier: tier, kind: "brand_subscription" },
    });
    productByTier.set(tier, product.id);
    return product.id;
  };

  for (const tier of Object.keys(BRAND_PLANS)) {
    if (!isPaidBrandTier(tier)) continue;
    for (const interval of ["monthly", "annual"]) {
      const lookupKey = brandLookupKey(tier, interval);
      const amount = brandPlanAmount(tier, interval);
      const prev = existing.get(lookupKey);
      if (prev && prev.amount_cents === amount && prev.price_id) {
        brandPriceCache.set(lookupKey, prev.price_id);
        continue;
      }
      const productId = await ensureProduct(tier);
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency: BILLING_CURRENCY,
        recurring: { interval: interval === "annual" ? "year" : "month" },
        lookup_key: lookupKey,
        transfer_lookup_key: true, // move the key off any prior price
        metadata: { plan_tier: tier, billing_interval: interval },
      });
      await pool.query(
        `INSERT INTO billing_catalog (lookup_key, tier, billing_interval, amount_cents, product_id, price_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE amount_cents = VALUES(amount_cents), product_id = VALUES(product_id), price_id = VALUES(price_id)`,
        [lookupKey, tier, interval, amount, productId, price.id]
      );
      brandPriceCache.set(lookupKey, price.id);
      console.log(`[BILLING] Ensured price ${lookupKey} = ${price.id} (${amount} ${BILLING_CURRENCY})`);
    }
  }
};

// Statuses that grant access outright. `trialing` counts.
const ACTIVE_SUB_STATUSES = new Set(["active", "trialing"]);

// Turn a stored row into an access decision. The heart of "don't cut off
// abruptly": a `past_due` subscription (a payment just failed, Stripe is
// retrying) keeps its tier until the grace deadline passes — so a bounced card
// never instantly locks a paying customer out. `paymentIssue` lets the UI warn
// them to fix their card without losing access.
const decideEntitlement = (row) => {
  const base = {
    tier: null,
    status: row?.status || null,
    isActive: false,
    paymentIssue: false,
    interval: row?.plan_interval || null,
    currentPeriodEnd: row?.current_period_end || null,
    graceUntil: row?.grace_until || null,
    cancelAtPeriodEnd: Boolean(row?.cancel_at_period_end),
  };
  if (!row) return base;

  if (ACTIVE_SUB_STATUSES.has(row.status)) {
    return { ...base, tier: row.plan_tier, isActive: true };
  }
  // Payment failed but still inside the grace window → keep access, flag it.
  if (row.status === "past_due") {
    const inGrace = Boolean(row.grace_until && new Date(row.grace_until).getTime() > Date.now());
    return { ...base, tier: inGrace ? row.plan_tier : null, isActive: inGrace, paymentIssue: true };
  }
  // canceled / unpaid / incomplete / incomplete_expired → no access.
  return base;
};

const getBrandSubscription = async (userId) => {
  const [rows] = await pool.query("SELECT * FROM brand_subscriptions WHERE user_id = ?", [userId]);
  return decideEntitlement(rows[0]);
};

// Derive our tier/interval from a Stripe subscription's price. We tag every
// Price with metadata at creation, and fall back to the lookup_key.
const tierFromStripeSubscription = (sub) => {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const meta = price?.metadata || {};
  let tier = meta.plan_tier;
  let interval = meta.billing_interval;
  if ((!tier || !interval) && price?.lookup_key) {
    const m = /^brand_(.+)_(monthly|annual)$/.exec(price.lookup_key);
    if (m) { tier = tier || m[1]; interval = interval || m[2]; }
  }
  return { tier: tier || null, interval: interval || null };
};

// The current period end (renewal date), in epoch seconds. It lives on the
// subscription in older API versions and moved to the subscription ITEM in the
// 2025+ line (our pinned 2026-03-25.dahlia) — read both so we store a real date
// regardless of version or webhook-vs-SDK object shape.
const periodEndSeconds = (sub) =>
  sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;

// In-app notification for a billing event. Best-effort — a notification
// failure must never break webhook processing (Stripe would retry the whole
// event and we'd double-handle the money side).
const notifyBilling = async (userId, type, title, message) => {
  if (!userId) return;
  try {
    await createNotification(pool, { userId, type, title, message, entityType: "brand_subscription", entityId: null });
  } catch (err) {
    console.error("[BILLING] notification failed:", err.message);
  }
};

// Upsert local state from a Stripe Subscription object — the single funnel for
// every subscription webhook. Detects the transition from the prior stored row
// so it can (a) open/clear the grace window and (b) fire the right lifecycle
// notification exactly once. Keyed by customer id, so it works even if we never
// saw the subscription before. Renewals, upgrades, downgrades, cancels and
// payment recovery all pass through here.
const upsertSubscriptionFromStripe = async (sub) => {
  const [priorRows] = await pool.query(
    "SELECT * FROM brand_subscriptions WHERE stripe_customer_id = ?",
    [sub.customer]
  );
  const prior = priorRows[0] || null;
  const userId = prior?.user_id || null;

  const { tier, interval } = tierFromStripeSubscription(sub);
  const pe = periodEndSeconds(sub);
  const periodEnd = pe ? toMysqlDate(pe * 1000) : null;
  const status = sub.status;
  const cancelAtPeriodEnd = sub.cancel_at_period_end ? 1 : 0;

  // Grace window: open it the moment we enter past_due, clear it once we're
  // active again, leave it untouched otherwise.
  let graceUntil = prior?.grace_until || null;
  const enteringPastDue = status === "past_due" && prior?.status !== "past_due";
  if (enteringPastDue) graceUntil = toMysqlDate(Date.now() + BRAND_GRACE_DAYS * MS_PER_DAY);
  else if (ACTIVE_SUB_STATUSES.has(status)) graceUntil = null;

  await pool.query(
    `UPDATE brand_subscriptions
       SET stripe_subscription_id = ?, plan_tier = ?, plan_interval = ?, status = ?,
           current_period_end = ?, cancel_at_period_end = ?, grace_until = ?
     WHERE stripe_customer_id = ?`,
    [sub.id, tier, interval, status, periodEnd, cancelAtPeriodEnd, graceUntil, sub.customer]
  );

  // ── Lifecycle notifications, one per real transition ──────────────────────
  const was = prior?.status;
  // Recovered: a failed payment went through on retry.
  if (was === "past_due" && ACTIVE_SUB_STATUSES.has(status)) {
    await notifyBilling(userId, "billing_recovered", "Payment recovered",
      "Your card went through — your subscription is fully active again.");
  }
  // Scheduled to cancel at period end (brand hit cancel; access runs to term).
  if (cancelAtPeriodEnd && !prior?.cancel_at_period_end && ACTIVE_SUB_STATUSES.has(status)) {
    await notifyBilling(userId, "billing_cancel_scheduled", "Subscription ending",
      `Your plan stays active until ${periodEnd || "the end of the period"}, then won't renew.`);
  }
  // Cancel undone before term.
  if (!cancelAtPeriodEnd && prior?.cancel_at_period_end && ACTIVE_SUB_STATUSES.has(status)) {
    await notifyBilling(userId, "billing_cancel_reverted", "Subscription resumed",
      "Your plan will keep renewing — the scheduled cancellation was removed.");
  }
  // Fully ended.
  if ((status === "canceled" || status === "unpaid") && was !== status) {
    await notifyBilling(userId, "billing_ended", "Subscription ended",
      "Your plan has ended and premium access is now off. Resubscribe anytime.");
  }
  // Tier changed while staying active (up/downgrade took effect).
  if (prior?.plan_tier && tier && prior.plan_tier !== tier && ACTIVE_SUB_STATUSES.has(status)) {
    await notifyBilling(userId, "billing_plan_changed", "Plan updated",
      `You're now on the ${tier} plan.`);
  }
};

// Reuse the brand's Stripe Customer across checkouts; create on first use.
//
// Serialized with a row lock: two near-simultaneous checkouts would otherwise
// both see "no customer", each create one, and the second overwrite the first's
// id — leaving a subscription whose customer no longer maps to any row, so its
// webhook UPDATE matches nothing and the paid subscription is silently lost.
// The claim-then-lock makes concurrent callers wait and reuse the same customer.
const ensureBrandCustomer = async (userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Ensure a row exists to lock (no-op if already there).
    await conn.query(
      "INSERT INTO brand_subscriptions (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id",
      [userId]
    );
    const [rows] = await conn.query(
      "SELECT stripe_customer_id FROM brand_subscriptions WHERE user_id = ? FOR UPDATE",
      [userId]
    );
    if (rows[0]?.stripe_customer_id) {
      await conn.commit();
      return rows[0].stripe_customer_id;
    }

    const [userRows] = await conn.query("SELECT email, name FROM users WHERE id = ?", [userId]);
    const user = userRows[0] || {};
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { app_user_id: String(userId) },
    });
    await conn.query(
      "UPDATE brand_subscriptions SET stripe_customer_id = ? WHERE user_id = ?",
      [customer.id, userId]
    );
    await conn.commit();
    return customer.id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Express guard for a tier-gated brand feature. Returns 402 with an upgrade
// payload the frontend turns into the upgrade dialog. Apply to brand endpoints
// as they gain tier requirements: app.post('/x', authenticate, requireFeature('analytics.advanced'), handler).
const requireFeature = (featureKey) => async (req, res, next) => {
  try {
    const required = BRAND_FEATURE_MIN_TIER[featureKey];
    if (!required) return next(); // ungated feature
    const { tier } = await getBrandSubscription(req.user.id);
    if (brandTierRank(tier) >= brandTierRank(required)) return next();
    return res.status(402).json({
      error: "upgrade_required",
      feature: featureKey,
      requiredTier: required,
      currentTier: tier,
    });
  } catch (err) {
    console.error("[BILLING] requireFeature failed:", err);
    return res.status(500).json({ message: "Entitlement check failed" });
  }
};

const FRONTEND_BASE = process.env.FRONTEND_URL || "https://mvp.influ-link.com";

// Start a subscription checkout for the signed-in brand.
app.post("/api/billing/checkout", requireBrandsEnabled, billingLimiter, authenticate, async (req, res) => {
  try {
    if (!STRIPE_LIVE) return res.status(503).json({ message: "Billing is not configured" });
    const { tier, interval = "monthly" } = req.body || {};

    if (!isPaidBrandTier(tier)) {
      return res.status(400).json({ message: "Unknown or non-subscribable plan" });
    }
    if (!["monthly", "annual"].includes(interval)) {
      return res.status(400).json({ message: "Invalid billing interval" });
    }

    // Only brands subscribe to brand plans.
    const [userRows] = await pool.query("SELECT account_type FROM users WHERE id = ?", [req.user.id]);
    if (userRows[0]?.account_type !== "brand") {
      return res.status(403).json({ message: "Only brand accounts can subscribe to brand plans" });
    }

    // ONE active plan per account. If the brand already has a live subscription,
    // refuse to open a second checkout — they must change the existing plan
    // instead. This is the server-side guarantee behind "1 plan per account":
    // it holds even if the client's view of the subscription is stale.
    const existing = await getBrandSubscription(req.user.id);
    if (existing.isActive || existing.status === "past_due") {
      return res.status(409).json({
        message: "You already have an active plan. Change your plan instead of starting a new one.",
        shouldChangePlan: true,
        currentTier: existing.tier,
      });
    }

    const priceId = brandPriceCache.get(brandLookupKey(tier, interval));
    if (!priceId) return res.status(503).json({ message: "Plan price is not available yet" });

    const customerId = await ensureBrandCustomer(req.user.id);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: String(req.user.id),
      subscription_data: { metadata: { app_user_id: String(req.user.id), plan_tier: tier, billing_interval: interval } },
      allow_promotion_codes: true,
      success_url: `${FRONTEND_BASE}/pricing?checkout=success`,
      cancel_url: `${FRONTEND_BASE}/pricing?checkout=cancelled`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("[BILLING] checkout failed:", err);
    res.status(500).json({ message: "Could not start checkout" });
  }
});

// Current subscription + the entitlement map, so the UI can gate locally.
app.get("/api/billing/subscription", requireBrandsEnabled, authenticate, async (req, res) => {
  try {
    const sub = await getBrandSubscription(req.user.id);
    res.json({ subscription: sub, features: BRAND_FEATURE_MIN_TIER, ranks: Object.fromEntries(Object.entries(BRAND_PLANS).map(([k, v]) => [k, v.rank])) });
  } catch (err) {
    console.error("[BILLING] subscription fetch failed:", err);
    res.status(500).json({ message: "Could not load subscription" });
  }
});

// Stripe Billing Portal link so brands manage/cancel/switch plans themselves.
app.post("/api/billing/portal", requireBrandsEnabled, billingLimiter, authenticate, async (req, res) => {
  try {
    if (!STRIPE_LIVE) return res.status(503).json({ message: "Billing is not configured" });
    const [rows] = await pool.query(
      "SELECT stripe_customer_id FROM brand_subscriptions WHERE user_id = ?",
      [req.user.id]
    );
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return res.status(404).json({ message: "No billing account yet" });
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${FRONTEND_BASE}/pricing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("[BILLING] portal failed:", err);
    res.status(500).json({ message: "Could not open billing portal" });
  }
});

// Switch an existing subscription to a different tier/interval, in place, with
// fair proration. Stripe credits the unused portion of the old plan and charges
// the prorated difference for the new one on the next invoice — no second
// subscription, no double-charge. Use this instead of checkout when the brand
// already has a live subscription (the pricing page routes accordingly).
app.post("/api/billing/change-plan", requireBrandsEnabled, billingLimiter, authenticate, async (req, res) => {
  try {
    if (!STRIPE_LIVE) return res.status(503).json({ message: "Billing is not configured" });
    const { tier, interval = "monthly" } = req.body || {};
    if (!isPaidBrandTier(tier)) return res.status(400).json({ message: "Unknown or non-subscribable plan" });
    if (!["monthly", "annual"].includes(interval)) return res.status(400).json({ message: "Invalid billing interval" });

    const [rows] = await pool.query(
      "SELECT stripe_subscription_id, plan_tier, plan_interval, status FROM brand_subscriptions WHERE user_id = ?",
      [req.user.id]
    );
    const row = rows[0];
    if (!row?.stripe_subscription_id) {
      // No live subscription — there's nothing to change; caller should checkout.
      return res.status(409).json({ message: "No active subscription to change", shouldCheckout: true });
    }
    // A canceled/unpaid/incomplete subscription can't be modified in place —
    // guard direct API calls (the UI already routes these to checkout) so we
    // return a clean 409 instead of a Stripe error.
    if (!["active", "trialing", "past_due"].includes(row.status)) {
      return res.status(409).json({ message: "Subscription is not active", shouldCheckout: true });
    }
    if (row.plan_tier === tier && row.plan_interval === interval) {
      return res.status(400).json({ message: "Already on this plan" });
    }

    const newPriceId = brandPriceCache.get(brandLookupKey(tier, interval));
    if (!newPriceId) return res.status(503).json({ message: "Plan price is not available yet" });

    const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    const itemId = sub.items.data[0].id;

    const updated = await stripe.subscriptions.update(row.stripe_subscription_id, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "create_prorations", // credit old, charge the difference
      // If a cancel was scheduled, switching plan implies they're staying.
      cancel_at_period_end: false,
      metadata: { app_user_id: String(req.user.id), plan_tier: tier, billing_interval: interval },
    });

    // Reflect the change immediately (the webhook also confirms it).
    await upsertSubscriptionFromStripe(updated);
    res.json({ ok: true, tier, interval });
  } catch (err) {
    console.error("[BILLING] change-plan failed:", err);
    res.status(500).json({ message: "Could not change plan" });
  }
});

// =======================
// CAMPAIGN ROUTES
// =======================

// Create a campaign
app.post(
  "/api/campaigns/create",
  authenticate,
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "referenceImages", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      // Honeypot: silently drop bot submissions (hidden field filled).
      if (isHoneypotTripped(req.body)) {
        logSecurityEvent("honeypot_campaign", req, { userId: req.user?.id });
        return res.status(400).json({ message: "Invalid submission" });
      }

      const userId = req.user.id;
      const {
        name,
        description,
        type,
        date,
        budget,
        goal,
        platforms,
        niches,
        contentTypes,
        country,
        language,
        deliverables,
        applicationDeadline,
        minFollowers,
        requirements,
      } = req.body;

      // Validate required fields
      if (!name || !description || !type || !date || !budget || !goal) {
        return res
          .status(400)
          .json({ message: "Missing required campaign fields" });
      }

      // Optional brief fields. Normalise empty strings to NULL and coerce the
      // follower minimum to a non-negative integer (or NULL if not provided).
      const briefDeliverables = deliverables && String(deliverables).trim() ? String(deliverables).trim() : null;
      const briefDeadline = applicationDeadline && String(applicationDeadline).trim() ? String(applicationDeadline).trim() : null;
      const briefRequirements = requirements && String(requirements).trim() ? String(requirements).trim() : null;
      let briefMinFollowers = null;
      if (minFollowers !== undefined && minFollowers !== null && String(minFollowers).trim() !== "") {
        const n = parseInt(minFollowers, 10);
        briefMinFollowers = Number.isFinite(n) && n >= 0 ? n : null;
      }

      // Parse JSON arrays
      let parsedPlatforms = [];
      let parsedNiches = [];
      let parsedContentTypes = [];
      let parsedLanguage = [];

      try {
        parsedPlatforms = platforms ? JSON.parse(platforms) : [];
        parsedNiches = niches ? JSON.parse(niches) : [];
        parsedContentTypes = contentTypes ? JSON.parse(contentTypes) : [];
        parsedLanguage = language ? JSON.parse(language) : [];
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON format in arrays" });
      }

      // Handle uploaded files
      const companyLogo = req.files["companyLogo"]?.[0]
        ? `/uploads/${req.files["companyLogo"][0].filename}`
        : null;

      const referenceImages =
        req.files["referenceImages"]?.map(
          (file) => `/uploads/${file.filename}`
        ) || [];

      // Insert campaign into DB
      const [result] = await pool.query(
        `INSERT INTO campaigns
    	(brand_id, name, description, type, start_date, budget, goal,
     	platforms, niches, contentTypes, country, language, company_logo, reference_images,
     	deliverables, application_deadline, min_followers, requirements, status, created_at)
   	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', NOW())`,
        [
          userId,
          name,
          description,
          type,
          date,
          budget,
          goal,
          JSON.stringify(parsedPlatforms),
          JSON.stringify(parsedNiches),
          JSON.stringify(parsedContentTypes),
          country,
          JSON.stringify(parsedLanguage),
          companyLogo,
          JSON.stringify(referenceImages),
          briefDeliverables,
          briefDeadline,
          briefMinFollowers,
          briefRequirements,
        ]
      );

      const campaignId = result.insertId;

      res.status(201).json({
        message: "Campaign created successfully",
        campaign: {
          id: campaignId,
          name,
          description,
          type,
          date,
          budget,
          goal,
          platforms: parsedPlatforms,
          niches: parsedNiches,
          contentTypes: parsedContentTypes,
          country,
          language: parsedLanguage,
          companyLogo,
          referenceImages,
          deliverables: briefDeliverables,
          application_deadline: briefDeadline,
          min_followers: briefMinFollowers,
          requirements: briefRequirements,
        },
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  }
);

app.get("/api/campaigns", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT * FROM campaigns WHERE brand_id = ? ORDER BY created_at DESC",
      [userId]
    );

    console.log(rows);

    const campaigns = rows.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      status: c.status,
      budget: c.budget,
      budgetSpent: c.budget_spent,
      impressions: c.impressions,
      reach: c.reach,

      // normalize
      startDate: c.start_date,
      companyLogo: c.company_logo,
      referenceImages: c.reference_images ? JSON.parse(c.reference_images) : [],
      platforms: c.platforms ? JSON.parse(c.platforms) : [],
      language: c.language ? JSON.parse(c.language) : [],
      contentTypes: c.contentTypes ? JSON.parse(c.contentTypes) : [],
      country: c.country,
      niches: c.niches ? JSON.parse(c.niches) : [],
    }));

    res.json(campaigns);
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

app.get("/api/campaigns/history", authenticate, async (req, res) => {
  try {
    const creatorId = req.user.id;

    const query = `
      SELECT 
        c.id, c.name, c.start_date as date, c.company_logo,
        cp.status, cp.earnings, cp.performance_reach, cp.performance_engagement,
        u.name as brand_name
      FROM campaign_participants cp
      INNER JOIN campaigns c ON cp.campaign_id = c.id
      INNER JOIN users u ON c.brand_id = u.id
      WHERE cp.user_id = ?
      ORDER BY c.start_date DESC;
    `;

    const [rows] = await pool.query(query, [creatorId]);

    const history = rows.map((r) => ({
      id: r.id,
      name: r.name,
      brand: r.brand_name,
      date: r.date,
      status: r.status,
      earnings: parseFloat(r.earnings || 0),
      reach: r.performance_reach?.toLocaleString() || "0",
      engagement: r.performance_engagement || "0%",
      brandLogo: r.company_logo
    }));

    res.json(history);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/payments/creator-finished', authenticate, async (req, res) => {
  try {
    const { dealPaymentId } = req.body;
    const creatorId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM deal_payments WHERE id = ? AND creator_user_id = ?', [dealPaymentId, creatorId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Deal not found' });

    const payment = rows[0];
    if (payment.status === 'transferred') return res.status(400).json({ error: 'Already released' });
    if (payment.status !== 'paid') return res.status(400).json({ error: 'Payment is not funded yet' });

    await pool.query('UPDATE deal_payments SET creator_marked_done = 1 WHERE id = ?', [dealPaymentId]);

    await createNotification(pool, {
      userId: payment.brand_user_id, type: 'campaign_finished',
      title: 'Creator marked the campaign finished',
      message: 'Review the work and approve to release the funds.',
      entityType: 'deal_payment', entityId: dealPaymentId,
    });

    const result = await attemptRelease(dealPaymentId, creatorId);
    res.json({ success: true, released: result.released, creatorMarkedDone: true });
  } catch (err) {
    console.error('creator-finished error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function attemptRelease(dealPaymentId, actorUserId = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM deal_payments WHERE id = ? FOR UPDATE', [dealPaymentId]
    );
    if (rows.length === 0) { await connection.rollback(); return { released: false, reason: 'not_found' }; }
    const payment = rows[0];

    // Gate: funds captured AND both parties approved
    if (payment.status !== 'paid' || !payment.creator_marked_done || !payment.brand_approved) {
      await connection.commit();
      return { released: false, reason: 'not_ready' };
    }

    const [creatorRows] = await connection.query(
      'SELECT stripe_account_id FROM users WHERE id = ?', [payment.creator_user_id]
    );
    const creatorStripeId = creatorRows[0]?.stripe_account_id;
    if (!creatorStripeId) { await connection.rollback(); return { released: false, reason: 'no_stripe_account' }; }

    // Finalise the commission HERE, at release — this is when the money actually
    // splits, so the creator's tier is based on their lifetime earnings at the
    // moment of payout (see COMMISSION_TIERS). The values stored at create-intent
    // were a provisional estimate shown to the brand. Recomputing the split does
    // NOT re-charge the brand: the brand's total charge (deal + fee) is fixed and
    // independent of the commission — we only change how the deal amount is
    // divided between the platform and the creator.
    const deal = Number(payment.deal_amount);
    const lifetimeEarnings = await getCreatorLifetimeEarnings(payment.creator_user_id);
    const commissionPercent = commissionPercentForEarnings(lifetimeEarnings);
    const commissionAmount = Math.round((deal * commissionPercent / 100) * 100) / 100;
    const creatorPayout = Math.round((deal - commissionAmount) * 100) / 100;

    // Move the creator's share from the platform balance to their connected
    // account. Platform keeps the commission.
    const transfer = await stripe.transfers.create({
      amount: Math.round(creatorPayout * 100),
      currency: 'eur',
      destination: creatorStripeId,
      transfer_group: payment.stripe_payment_intent_id,
      // Draw the payout from the original charge's funds. Works even if the
      // platform's available balance hasn't settled yet.
      ...(payment.stripe_charge_id ? { source_transaction: payment.stripe_charge_id } : {}),
      metadata: { dealPaymentId: payment.id, campaignId: payment.campaign_id },
    }, { idempotencyKey: `release_${payment.id}` });

    await connection.query(
      `UPDATE deal_payments
         SET status = 'transferred', stripe_transfer_id = ?, released_at = NOW(),
             commission_percent = ?, commission_amount = ?, creator_payout = ?
       WHERE id = ?`,
      [transfer.id, commissionPercent, commissionAmount, creatorPayout, payment.id]
    );
    await connection.query(
      `UPDATE campaign_participants SET status = 'completed', earnings = ?
       WHERE campaign_id = ? AND user_id = ?`,
      [creatorPayout, payment.campaign_id, payment.creator_user_id]
    );

    // Always tell the creator they got paid (this notification carries the
    // "View Stripe balance" button and is a persistent payment record).
    await createNotification(connection, {
      userId: payment.creator_user_id, type: 'payment_released',
      title: 'Payment released!', message: 'Funds have been released to your account.',
      entityType: 'deal_payment', entityId: payment.id,
    });
    // Only notify the brand if they didn't trigger the release themselves
    // (when they click Approve & Release they already get immediate feedback).
    if (actorUserId !== payment.brand_user_id) {
      await createNotification(connection, {
        userId: payment.brand_user_id, type: 'payment_completed',
        title: 'Funds released', message: 'The creator has been paid for the completed campaign.',
        entityType: 'deal_payment', entityId: payment.id,
      });
    }

    await connection.commit();
    return { released: true, transferId: transfer.id };
  } catch (err) {
    await connection.rollback();
    console.error('[RELEASE] error:', err);
    throw err;
  } finally {
    connection.release();
  }
}

const ensureEscrowColumns = async () => {
  const conn = await pool.getConnection();
  try {
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deal_payments'`,
      [process.env.DB_DATABASE]
    );
    const names = new Set(cols.map(c => c.COLUMN_NAME));
    const alters = [];
    if (!names.has('creator_marked_done')) alters.push("ADD COLUMN creator_marked_done TINYINT(1) NOT NULL DEFAULT 0");
    if (!names.has('brand_approved')) alters.push("ADD COLUMN brand_approved TINYINT(1) NOT NULL DEFAULT 0");
    if (!names.has('released_at')) alters.push("ADD COLUMN released_at DATETIME NULL");
    if (!names.has('stripe_fee_actual')) alters.push("ADD COLUMN stripe_fee_actual DECIMAL(10,2) NULL");
    if (!names.has('stripe_net')) alters.push("ADD COLUMN stripe_net DECIMAL(10,2) NULL");
    if (!names.has('stripe_charge_id')) alters.push("ADD COLUMN stripe_charge_id VARCHAR(255) NULL");
    if (alters.length) {
      await conn.query(`ALTER TABLE deal_payments ${alters.join(", ")}`);
      console.log(`[ESCROW] Added ${alters.length} column(s) to deal_payments`);
    }
  } catch (err) {
    console.error("[ESCROW] Column migration failed:", err.message);
  } finally {
    conn.release();
  }
};
// call it: ensureEscrowColumns();

// Campaign brief fields shown to creators (and set by brands on creation):
// deliverables, application deadline, minimum followers and free-text
// requirements/guidelines. Idempotent — safe to run on every boot.
const ensureCampaignBriefColumns = async () => {
  const conn = await pool.getConnection();
  try {
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'campaigns'`,
      [process.env.DB_DATABASE]
    );
    const names = new Set(cols.map(c => c.COLUMN_NAME));
    const alters = [];
    if (!names.has('deliverables')) alters.push("ADD COLUMN deliverables TEXT NULL");
    if (!names.has('application_deadline')) alters.push("ADD COLUMN application_deadline DATE NULL");
    if (!names.has('min_followers')) alters.push("ADD COLUMN min_followers INT NULL");
    if (!names.has('requirements')) alters.push("ADD COLUMN requirements TEXT NULL");
    if (alters.length) {
      await conn.query(`ALTER TABLE campaigns ${alters.join(", ")}`);
      console.log(`[CAMPAIGN] Added ${alters.length} brief column(s) to campaigns`);
    }
  } catch (err) {
    console.error("[CAMPAIGN] Brief column migration failed:", err.message);
  } finally {
    conn.release();
  }
};

const migrateExistingConnections = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch all existing campaigns
    const [campaigns] = await connection.query("SELECT id, brand_id, budget FROM campaigns");

    // 2. Fetch creators (Adjust 'role' based on your users table)
    const [creators] = await connection.query("SELECT id FROM users WHERE account_type = 'creator'");

    if (campaigns.length === 0 || creators.length === 0) {
      console.log("Nothing to migrate.");
      return;
    }

    const values = [];

    // 3. Logic: For demo/testing, we link creators to campaigns
    // In a real app, you might match these based on an 'applications' table
    campaigns.forEach((campaign) => {
      // Example: Assigning the first 2 creators to every campaign for testing
      const assignedCreators = creators;

      assignedCreators.forEach(creator => {
        values.push([
          campaign.id,
          creator.id,
          'completed',             // Default status for history
          campaign.budget * 0.1,    // Sample earnings (10% of budget)
          Math.floor(Math.random() * 50000), // Sample reach
          "4.5%"                   // Sample engagement
        ]);
      });
    });

    // 4. Batch Insert (IGNORE skips duplicates if you run this twice)
    const sql = `
      INSERT IGNORE INTO campaign_participants 
      (campaign_id, user_id, status, earnings, performance_reach, performance_engagement) 
      VALUES ?
    `;

    await connection.query(sql, [values]);
    await connection.commit();

    console.log(`Successfully backfilled ${values.length} participation records.`);
  } catch (err) {
    await connection.rollback();
    console.error("Migration error:", err);
  } finally {
    connection.release();
  }
};

function formatReach(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
}

// DELETE campaign by ID
app.delete("/api/campaigns/:profileId/:campaignId", authenticate, async (req, res) => {
  const { campaignId } = req.params;
  // Ownership is enforced via the authenticated user id, not the URL param.
  const profileId = req.user.id;
  try {
    // 1. Update notifications for proposals related to this campaign
    await pool.query(
      `UPDATE notifications 
       SET message = 'This campaign is no longer available.'
       WHERE entity_id IN (
         SELECT id FROM proposals WHERE campaign_id = ?
       ) AND entity_type = 'proposal'`,
      [campaignId]
    );

    // 2. Update notifications for invites related to this campaign
    await pool.query(
      `UPDATE notifications 
       SET message = 'This campaign is no longer available.'
       WHERE entity_id IN (
         SELECT id FROM campaign_invitations WHERE campaign_id = ?
       ) AND entity_type = 'invite'`,
      [campaignId]
    );

    // 3. Delete the campaign
    const [result] = await pool.query(
      "DELETE FROM campaigns WHERE id = ? AND brand_id = ?",
      [campaignId, profileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Campaign not found or not yours" });
    }

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("Failed to delete campaign:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const formatMySQLDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toISOString().slice(0, 19).replace("T", " ");
};

app.put(
  "/api/campaigns/:id",
  authenticate,
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "referenceImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const campaignId = req.params.id;

      /** ---------- OWNERSHIP CHECK ---------- */
      const [rows] = await pool.query(
        "SELECT * FROM campaigns WHERE id = ? AND brand_id = ?",
        [campaignId, userId]
      );

      if (!rows.length) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const campaign = rows[0];

      /** ---------- BODY ---------- */
      const {
        name,
        description,
        type,
        status,
        primaryGoal,
        budget,
        startDate,
      } = req.body;

      /** ---------- FILES ---------- */
      const logoFile = req.files?.companyLogo?.[0];
      const newImages = req.files?.referenceImages || [];

      const removedImagesRaw = req.body["removedImages[]"];
      const removedImages = removedImagesRaw
        ? Array.isArray(removedImagesRaw)
          ? removedImagesRaw
          : [removedImagesRaw]
        : [];

      /** ---------- HANDLE LOGO ---------- */
      let companyLogo = campaign.company_logo;
      if (logoFile) {
        companyLogo = `/uploads/${logoFile.filename}`;
      }

      /** ---------- HANDLE REFERENCE IMAGES ---------- */
      const existingImages = campaign.reference_images
        ? JSON.parse(campaign.reference_images)
        : [];

      // remove deleted images
      const filteredImages = existingImages.filter(
        (img) => !removedImages.includes(img)
      );

      // delete removed images from disk
      removedImages.forEach((img) => {
        const filePath = img.startsWith("/") ? img.slice(1) : img;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // add new images
      const uploadedImages = newImages.map(
        (f) => `/uploads/${f.filename}`
      );

      const finalImages = [...filteredImages, ...uploadedImages];

      /** ---------- UPDATE ---------- */
      await pool.query(
        `
        UPDATE campaigns SET
          name = ?,
          description = ?,
          type = ?,
          status = ?,
          budget = ?,
          start_date = ?,
          company_logo = ?,
          reference_images = ?
        WHERE id = ?
        `,
        [
          name,
          description,
          type,
          status,
          Number(budget),
          formatMySQLDate(startDate),
          companyLogo,
          JSON.stringify(finalImages),
          campaignId,
        ]
      );

      /** ---------- RESPONSE ---------- */
      res.json({
        success: true,
        campaign: {
          id: campaignId,
          name,
          description,
          type,
          status,
          budget: Number(budget),
          startDate,
          companyLogo,
          referenceImages: finalImages,
        },
      });
    } catch (err) {
      console.error("Failed to update campaign:", err);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  }
);

app.post("/api/:userId/campaigns/:campaignId/impression", authenticate, async (req, res) => {
  const { campaignId } = req.params;
  // Use the authenticated user as the unique viewer, so reach can't be spoofed
  // by supplying arbitrary userIds in the URL.
  const userId = req.user.id;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Attempt to insert the unique viewer.
    // If (campaign_id, creator_id) already exists, it does nothing.
    const [insertResult] = await conn.query(
      `INSERT IGNORE INTO campaign_impressions (campaign_id, creator_id) VALUES (?, ?)`,
      [campaignId, userId]
    );

    console.log(insertResult);
    console.log(insertResult.affectedRows);

    /**
     * KEY LOGIC:
     * affectedRows === 1 means a BRAND NEW user was recorded.
     * affectedRows === 0 means this user has seen it before.
     */
    if (insertResult.affectedRows === 1) {
      // ONLY increment REACH if the user is truly new
      // We increment impressions here too for the very first view
      await conn.query(
        `UPDATE campaigns 
         SET reach = reach + 1, 
             impressions = impressions + 1 
         WHERE id = ?`,
        [campaignId]
      );
    } else {
      // If the user already exists, ONLY increment impressions
      // This is what prevents Reach from climbing on reload!
      await conn.query(
        `UPDATE campaigns 
         SET impressions = impressions + 1 
         WHERE id = ?`,
        [campaignId]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: "Failed to track" });
  } finally {
    conn.release();
  }
});

app.post("/api/campaigns/search", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // get the authenticated user
    const {
      query,
      niches,
      platforms,
      contentTypes,
      collabTypes,
      country,
      countryCode,
      language,
      budgetRange,
      status,
      urgentOnly,
      sortBy,
      page = 1,
      limit = 12,
    } = req.body;

    const offset = (page - 1) * limit;

    // A campaign counts as "urgent" (immediate need) when it starts within the
    // next URGENT_WINDOW_DAYS. There is no separate deadline column, so start_date
    // proximity is the urgency signal (same basis as the "closing soon" sort).
    const URGENT_WINDOW_DAYS = 7;
    const urgentCondition =
      `(start_date IS NOT NULL AND start_date >= CURDATE() ` +
      `AND start_date <= DATE_ADD(CURDATE(), INTERVAL ${URGENT_WINDOW_DAYS} DAY))`;

    // Build WHERE conditions dynamically
    const where = [];
    const params = [];

    if (query) {
      where.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${query}%`, `%${query}%`);
    }

    const buildJsonContains = (field, values) => {
      if (!values || values.length === 0) return;
      const conditions = values.map(() => `JSON_CONTAINS(${field}, ?)`);
      where.push(`(${conditions.join(" OR ")})`);
      values.forEach((v) => params.push(`"${v}"`));
    };

    buildJsonContains("niches", niches);
    buildJsonContains("platforms", platforms);
    buildJsonContains("contentTypes", contentTypes);
    buildJsonContains("collabTypes", collabTypes);
    buildJsonContains("language", language);

    if (country && Array.isArray(country) && country.length > 0) {
      const validCountries = country.filter(c => c && c.trim());
      const validCodes = (countryCode || []).filter(c => c && c.trim());

      if (validCountries.length > 0) {
        const conditions = validCountries.map((_, i) =>
          validCodes[i] ? "(country = ? OR country = ?)" : "country = ?"
        ).join(" OR ");
        where.push(`(${conditions})`);
        validCountries.forEach((c, i) => {
          params.push(c);
          if (validCodes[i]) params.push(validCodes[i]);
        });
      }
    }

    if (budgetRange) {
      switch (budgetRange) {
        case "under_100":
          where.push("budget < 100");
          break;
        case "100_500":
          where.push("budget BETWEEN 100 AND 500");
          break;
        case "500_1k":
          where.push("budget BETWEEN 500 AND 1000");
          break;
        case "1k_plus":
          where.push("budget > 1000");
          break;
        // Keep these as fallbacks if you use them elsewhere, 
        // but the ones above are what your current UI sends.
        case "low":
          where.push("budget <= 100");
          break;
        case "mid":
          where.push("budget BETWEEN 100 AND 1000");
          break;
        case "high":
          where.push("budget > 1000");
          break;
      }
    }

    if (status && status !== "any") {
      where.push("status = ?");
      params.push(status);
    }

    if (urgentOnly) {
      where.push(urgentCondition);
    }

    const whereSQL = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // Count total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as count FROM campaigns ${whereSQL}`,
      params
    );
    const total = countResult[0].count;

    let orderBySQL = "c.created_at DESC";

    switch (sortBy) {
      case "budget_high":
        orderBySQL = "c.budget DESC";
        break;
      case "budget_low":
        orderBySQL = "c.budget ASC";
        break;
      case "deadline":
        // Since you don't have an end_date, we'll sort by start_date ascending 
        // (the ones starting soonest)
        orderBySQL = "c.start_date ASC";
        break;
      case "recent":
        orderBySQL = "c.created_at DESC";
        break;
      default:
        orderBySQL = "c.created_at DESC";
    }

    // Fetch campaigns with hasApplied info
    const [results] = await pool.query(
      `
  SELECT c.*,
    EXISTS(
      SELECT 1 FROM proposals p
      WHERE p.campaign_id = c.id AND p.creator_id = ?
    ) AS hasApplied,
    ${urgentCondition.replace(/start_date/g, "c.start_date")} AS isUrgent
  FROM campaigns c
  ${whereSQL}
  ORDER BY ${orderBySQL}
  LIMIT ? OFFSET ?
  `,
      [userId, ...params, Number(limit), Number(offset)]
    );

    // Normalize campaigns and parse JSON fields
    const campaigns = results.map((c) => ({
      ...c,
      referenceImages: c.reference_images ? JSON.parse(c.reference_images) : [],
      platforms: c.platforms ? JSON.parse(c.platforms) : [],
      language: c.language ? JSON.parse(c.language) : [],
      contentTypes: c.contentTypes ? JSON.parse(c.contentTypes) : [],
      collabTypes: c.collabTypes ? JSON.parse(c.collabTypes) : [],
      niches: c.niches ? JSON.parse(c.niches) : [],
      hasApplied: Boolean(c.hasApplied),
      isUrgent: Boolean(c.isUrgent),
      budget: Number(c.budget) // Ensure decimal is returned as a number
    }));

    console.log("Search results:", campaigns);

    res.json({ count: total, results: campaigns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search campaigns" });
  }
});

app.post("/api/proposals", authenticate, async (req, res) => {
  try {
    // Honeypot: silently drop bot spam (hidden field filled).
    if (isHoneypotTripped(req.body)) {
      logSecurityEvent("honeypot_proposal", req, { userId: req.user?.id });
      return res.status(400).json({ error: "Invalid submission" });
    }

    const { campaignId, message, deliverables, proposedPrice } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!campaignId || !message) {
      return res.status(400).json({ error: "campaignId and message are required" });
    }

    if (message.length < 20 || message.length > 2000) {
      return res.status(400).json({ error: "Invalid message length" });
    }

    if (proposedPrice !== undefined) {
      const price = Number(proposedPrice);
      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({ error: "Invalid proposed price" });
      }
    }

    const [[campaign]] = await pool.query(
      `SELECT id, brand_id, status FROM campaigns WHERE id = ?`,
      [campaignId]
    );

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== "open") {
      return res.status(400).json({ error: "Campaign is not open" });
    }

    if (campaign.brand_id === creatorId) {
      return res.status(403).json({ error: "Cannot apply to your own campaign" });
    }

    const [result] = await pool.query(
      `INSERT INTO proposals 
       (campaign_id, creator_id, message, deliverables, proposed_price, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [campaignId, creatorId, message, deliverables || null, proposedPrice || null]
    );

    console.log("Sending proposal:", {
      campaignId,
      message,
      messageLength: message?.length,
    });
    const proposalId = result.insertId;

    await createNotification(pool, {
      userId: campaign.brand_id,
      type: "proposal_received",
      title: "New proposal received",
      message: "A creator has applied to your campaign.",
      entityType: "proposal",
      entityId: proposalId,
    });

    res.json({ success: true, proposalId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "You have already applied to this campaign" });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
});

app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // <--- add this
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, type, title, message, entity_type, entity_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

cron.schedule("0 0 * * *", async () => {
  try {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL 30 DAY
    `;

    // Изпълняваме заявката директно през pool-а
    const [result] = await pool.query(query);

    if (result.affectedRows > 0) {
      console.log(`[${new Date().toISOString()}] 🧹 Auto-Cleanup: Изтрити са ${result.affectedRows} стари известия.`);
    } else {
      console.log(`[${new Date().toISOString()}] 🧹 Auto-Cleanup: Няма известия за триене.`);
    }
  } catch (err) {
    console.error("❌ Cron Job Error (Notification Cleanup):", err.message);
  }
});

// Refresh Instagram long-lived tokens before they expire (~60 days). Re-exchanging
// a still-valid long-lived token via fb_exchange_token returns a fresh 60-day
// token, so insights keep syncing without the user having to reconnect. Runs
// daily and only touches accounts within 10 days of expiry. A failure per account
// (e.g. the user revoked access) is logged and skipped — their next sync will
// surface the disconnect.
async function refreshInstagramTokens() {
  if (!process.env.FB_APP_ID || !process.env.FB_APP_SECRET) return;

  let rows;
  try {
    [rows] = await pool.query(
      `SELECT user_id, ig_user_id, access_token
         FROM instagram_accounts
        WHERE token_expires_at IS NOT NULL
          AND token_expires_at < DATE_ADD(NOW(), INTERVAL 10 DAY)`
    );
  } catch (err) {
    console.error("❌ Cron Job Error (IG token refresh query):", err.message);
    return;
  }

  if (!rows.length) return;
  console.log(`[IG REFRESH] ${rows.length} token(s) nearing expiry — refreshing...`);

  for (const acc of rows) {
    try {
      const current = decryptSecret(acc.access_token);
      const res = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
          new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: process.env.FB_APP_ID,
            client_secret: process.env.FB_APP_SECRET,
            fb_exchange_token: current,
          })
      );
      const data = await res.json();

      if (!res.ok || !data.access_token) {
        // Code 190 = the token is permanently dead (already expired / revoked)
        // and can't be re-exchanged. Clear the connection so the user is prompted
        // to reconnect, same as the sync path does.
        if (data?.error?.code === 190) {
          console.warn(`[IG REFRESH] Token dead for ig_user ${acc.ig_user_id} (code 190) — clearing connection.`);
          await pool.query("DELETE FROM instagram_analytics WHERE ig_user_id = ?", [acc.ig_user_id]);
          await pool.query("DELETE FROM instagram_accounts WHERE ig_user_id = ?", [acc.ig_user_id]);
          await pool.query(
            "UPDATE profiles SET instagram_linked = 0 WHERE id = (SELECT id FROM users WHERE id = ?)",
            [acc.user_id]
          );
          continue;
        }
        console.error(
          `[IG REFRESH] Failed for ig_user ${acc.ig_user_id}:`,
          data?.error?.message || res.status
        );
        continue;
      }

      // FB long-lived tokens default to ~60 days when expires_in is omitted.
      const expiresAt = new Date(Date.now() + (Number(data.expires_in) || 5184000) * 1000);
      await pool.query(
        "UPDATE instagram_accounts SET access_token = ?, token_expires_at = ? WHERE ig_user_id = ?",
        [encryptSecret(data.access_token), expiresAt, acc.ig_user_id]
      );
      console.log(`[IG REFRESH] Refreshed ig_user ${acc.ig_user_id} → ${expiresAt.toISOString()}`);
    } catch (err) {
      console.error(`[IG REFRESH] Error for ig_user ${acc.ig_user_id}:`, err.message);
    }
  }
}

cron.schedule("0 3 * * *", refreshInstagramTokens);

// Daily security digest at 08:00 (server time). Scanner probes and bot noise are
// folded into one summary email here instead of alerting per-event — see
// maybeSecurityAlert / DIGEST_ONLY_TYPES. No email is sent on a quiet day.
cron.schedule("0 8 * * *", sendSecurityDigest);



app.post("/api/notifications", authenticate, async (req, res) => {
  try {
    const { type, title, message, entity_type, entity_id } = req.body;

    // Never let a client create notifications for arbitrary users. Notifications
    // aimed at other users are created server-side by trusted flows via
    // createNotification(). This endpoint only creates self-notifications.
    await createNotification(pool, {
      userId: req.user.id,
      type,
      title,
      message,
      entityType: entity_type,
      entityId: entity_id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to create notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/proposals/:id/action", authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const proposalId = req.params.id;
    const { action } = req.body;
    const userId = req.user.id;

    await connection.beginTransaction();

    const [[proposal]] = await connection.query(
      `SELECT p.*, c.brand_id 
       FROM proposals p 
       LEFT JOIN campaigns c ON p.campaign_id = c.id 
       WHERE p.id = ?`,
      [proposalId]
    );

    if (!proposal) return res.status(404).json({ error: "Proposal not found" });
    if (proposal.brand_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    const newStatus = action === "accept" ? "accepted" : "rejected";
    await connection.query(
      "UPDATE proposals SET status = ? WHERE id = ?",
      [newStatus, proposalId]
    );

    if (action === "accept") {
      console.log(`Attempting to create chat for Creator: ${proposal.creator_id} and Brand: ${userId}`);
      const [chatResult] = await connection.query(
        `INSERT INTO chat_rooms (creator_id, brand_id, last_message) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE last_message = VALUES(last_message)`,
        [proposal.creator_id, userId, "Proposal accepted! You can now start chatting."]
      );
      console.log("Chat room operation result:", chatResult);
    }

    const notificationType = action === "accept" ? "proposal_accepted" : "proposal_rejected";
    const title = action === "accept" ? "Proposal accepted!" : "Proposal declined";
    const message = action === "accept"
      ? "Your proposal has been accepted. Get ready to collaborate!"
      : "Unfortunately, your proposal was not selected this time.";

    await createNotification(connection, {
      userId: proposal.creator_id,
      type: notificationType,
      title,
      message,
      entityType: "proposal",
      entityId: proposalId,
    });

    await connection.commit();
    res.json({ success: true, status: newStatus });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to process proposal action" });
  } finally {
    connection.release();
  }
});

app.post("/api/invite/:id/action", authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const inviteId = req.params.id;
    const { action } = req.body; // "accept" or "decline"
    const userId = req.user.id; // This is the Creator's ID

    await connection.beginTransaction();

    // 1. Verify the invite exists and belongs to this creator
    const [[invite]] = await connection.query(
      `SELECT ci.*, c.name as campaign_name, c.brand_id 
       FROM campaign_invitations ci
       JOIN campaigns c ON ci.campaign_id = c.id
       WHERE ci.id = ?`,
      [inviteId]
    );

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    // Security check: Only the invited creator can accept/decline
    if (invite.creator_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You were not the recipient of this invite" });
    }

    // 2. Update the status
    const newStatus = action === "accept" ? "accepted" : "declined";
    await connection.query(
      "UPDATE campaign_invitations SET status = ? WHERE id = ?",
      [newStatus, inviteId]
    );

    if (action === "accept") {
      const [existing] = await connection.query(
        `SELECT id FROM campaign_participants WHERE campaign_id = ? AND user_id = ?`,
        [invite.campaign_id, invite.creator_id]
      );

      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO campaign_participants (campaign_id, user_id, status) 
             VALUES (?, ?, 'In Progress')`,
          [invite.campaign_id, invite.creator_id]
        );
      }

      // ✅ Create chat room between creator and brand
      await connection.query(
        `INSERT INTO chat_rooms (creator_id, brand_id, last_message)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE last_message = VALUES(last_message)`,
        [
          invite.creator_id,
          invite.brand_id,
          "Invite accepted! You can now start chatting."
        ]
      );
    }

    // 3. Create the Notification for the Brand (the sender)
    const notificationType = action === "accept" ? "invite_accepted" : "invite_declined";
    const title = action === "accept" ? "Invite Accepted!" : "Invite Declined";
    const message = action === "accept"
      ? `A creator has accepted your invitation to join "${invite.campaign_name}".`
      : `A creator has declined your invitation for "${invite.campaign_name}".`;

    await createNotification(connection, {
      userId: invite.brand_id, // The Brand owner who sent the invite
      type: notificationType,
      title: title,
      message: message,
      entityType: "campaign_invite",
      entityId: inviteId,
    });

    await connection.commit();
    res.json({ success: true, status: newStatus });

  } catch (err) {
    await connection.rollback();
    console.error("Error processing invite action:", err);
    res.status(500).json({ error: "Failed to process invite action" });
  } finally {
    connection.release();
  }
});

app.get("/api/proposals/:id", authenticate, async (req, res) => {
  try {
    const proposalId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [[proposal]] = await pool.query(
      `SELECT 
         p.id,
         p.campaign_id,
         p.creator_id,
         p.message,
         p.deliverables,
         p.proposed_price,
         p.status,
         p.created_at,
         u.name AS creator_name
       FROM proposals p
       LEFT JOIN users u ON p.creator_id = u.id
       WHERE p.id = ?`,
      [proposalId]
    );

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const [[campaign]] = await pool.query(
      `SELECT brand_id FROM campaigns WHERE id = ?`,
      [proposal.campaign_id]
    );

    const isCampaignOwner = campaign && campaign.brand_id === userId;
    const isProposalOwner = proposal.creator_id === userId;

    if (!isCampaignOwner && !isProposalOwner) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch proposal details" });
  }
});

app.get("/api/notifications/unread-count", authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS count FROM notifications 
       WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );
    res.json({ count: row.count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

app.post("/api/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const [result] = await pool.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    console.log("READ CHANGED!");

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

app.post("/api/notifications/read-all", authenticate, async (req, res) => {
  const userId = req.user.id;

  await pool.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE user_id = ? AND is_read = 0`,
    [userId]
  );

  res.json({ success: true });
});

app.post("/api/campaigns/invite", authenticate, async (req, res) => {
  try {
    const brandId = req.user.id;
    const { creatorId, campaignId, message } = req.body;
    if (!creatorId || !campaignId) {
      return res.status(400).json({ error: "Missing creatorId or campaignId" });
    }
    // 1. Verify campaign ownership
    const [campaigns] = await pool.query(
      `SELECT id, name FROM campaigns WHERE id = ? AND brand_id = ?`,
      [campaignId, brandId]
    );
    if (campaigns.length === 0) {
      return res.status(403).json({ error: "Unauthorized campaign access" });
    }
    const campaign = campaigns[0];
    // 2. Insert invitation
    const [result] = await pool.query(
      `INSERT IGNORE INTO campaign_invitations
       (campaign_id, creator_id, brand_id, message)
       VALUES (?, ?, ?, ?)`,
      [campaignId, creatorId, brandId, message || null]
    );
    // 3. Notification
    await pool.query(
      `INSERT INTO notifications
       (user_id, type, title, message, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        creatorId,
        "campaign_invite",
        "Campaign Invitation",
        message
          ? message.slice(0, 140)
          : `You've been invited to collaborate on "${campaign.name}".`,
        "invite",
        result.insertId
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

app.get('/api/invite/:id', authenticate, async (req, res) => {
  const inviteId = req.params.id;
  const userId = req.user.id;
  try {
    const [invites] = await pool.execute(
      `SELECT 
        ci.*, 
        c.name AS campaign_name, 
        c.description AS campaign_description,
        c.budget AS campaign_budget
       FROM campaign_invitations ci
       LEFT JOIN campaigns c ON ci.campaign_id = c.id
       WHERE ci.id = ? AND ci.creator_id = ?`,
      [inviteId, userId]
    );

    if (invites.length === 0) {
      return res.status(404).json({ error: "Invite not found or unauthorized" });
    }

    const invite = invites[0];

    res.json({
      id: invite.id,
      campaign_id: invite.campaign_id,
      brand_id: invite.brand_id,
      message: invite.message,
      status: invite.status,
      campaign_name: invite.campaign_name || null,
      campaign_description: invite.campaign_description || null,
      campaign_budget: invite.campaign_budget || null,
      created_at: invite.created_at,
      logo: invite.avatar || null,
    });
  } catch (error) {
    console.error("Database error fetching invite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/consent/update', authenticate, async (req, res) => {
  const { analytics, marketing } = req.body;

  try {
    // Scope the update to the authenticated user; never trust a body-supplied
    // email (that let anyone rewrite another user's GDPR consent flags).
    const query = `
            UPDATE users
            SET
                gdpr_consent = 1,
                consent_analytics = ?,
                consent_marketing = ?,
                consent_date = NOW()
            WHERE id = ?
        `;

    const [result] = await pool.execute(query, [
      analytics ? 1 : 0,
      marketing ? 1 : 0,
      req.user.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Preferences saved successfully" });
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/links", authenticate, async (req, res) => {
  const userId = req.user.id;
  const accountType = req.user.accountType;
  // Never string-interpolate accountType into SQL. Reduce it to booleans here;
  // `${isBrand}`/`${isCreator}` render as literal true/false, which can't inject.
  // Defence in depth — accountType is also whitelisted at registration.
  const isBrand = accountType === "brand";
  const isCreator = accountType === "creator";
  // accountType is interpolated into the SQL below, so hard-restrict it to the
  // only two valid literals. This closes the injection vector even though the
  // value currently originates from the signed JWT.
  if (accountType !== "brand" && accountType !== "creator") {
    return res.status(400).json({ message: "Invalid account type" });
  }
  try {
    const sql = `
      SELECT DISTINCT
        partner.id as partnerId,
        partner.name as partnerName,
        partner.account_type as partnerRole,
        pr.handle,
        pr.avatar,
        p.status as proposalStatus,
        p.created_at as proposalDate,
        p.proposed_price as proposedPrice,
        c.id as campaignId,
        c.name as campaignName,
        c.budget as campaignBudget,
        dp.id as dealPaymentId,
        dp.status as paymentStatus,
        dp.creator_payout as creatorPayout,
        dp.creator_marked_done as creatorMarkedDone,
        dp.brand_approved as brandApproved
      FROM proposals p
      INNER JOIN campaigns c ON p.campaign_id = c.id
      INNER JOIN users partner ON (
        (${isBrand} AND partner.id = p.creator_id) OR
        (${isCreator} AND partner.id = c.brand_id)
      )
      LEFT JOIN profiles pr ON pr.id = partner.id
      LEFT JOIN deal_payments dp ON dp.campaign_id = c.id
        AND dp.brand_user_id = c.brand_id
        AND dp.creator_user_id = p.creator_id
        AND dp.status IN ('paid', 'transferred')
      WHERE (${isBrand} AND c.brand_id = ?) 
         OR (${isCreator} AND p.creator_id = ?)
      UNION
      SELECT DISTINCT
        partner.id as partnerId,
        partner.name as partnerName,
        partner.account_type as partnerRole,
        pr.handle,
        pr.avatar,
        ci.status as proposalStatus,
        ci.created_at as proposalDate,
        NULL as proposedPrice,
        c.id as campaignId,
        c.name as campaignName,
        c.budget as campaignBudget,
        dp.id as dealPaymentId,
        dp.status as paymentStatus,
        dp.creator_payout as creatorPayout,
        dp.creator_marked_done as creatorMarkedDone,
        dp.brand_approved as brandApproved
      FROM campaign_invitations ci
      INNER JOIN campaigns c ON ci.campaign_id = c.id
      INNER JOIN users partner ON (
        (${isBrand} AND partner.id = ci.creator_id) OR
        (${isCreator} AND partner.id = ci.brand_id)
      )
      LEFT JOIN profiles pr ON pr.id = partner.id
      LEFT JOIN deal_payments dp ON dp.campaign_id = c.id
        AND dp.brand_user_id = ci.brand_id
        AND dp.creator_user_id = ci.creator_id
        AND dp.status IN ('paid', 'transferred')
      WHERE ci.status = 'accepted'
        AND (
          (${isBrand} AND ci.brand_id = ?) OR
          (${isCreator} AND ci.creator_id = ?)
        )
      ORDER BY proposalDate DESC
    `;
    const [rows] = await pool.query(sql, [userId, userId, userId, userId]);
    const formatted = rows.map(row => ({
      id: row.partnerId.toString(),
      name: row.partnerName || "User",
      handle: row.handle || "user",
      avatar: row.avatar,
      role: row.partnerRole,
      status: row.proposalStatus,
      currentCampaign: row.campaignName,
      campaignId: row.campaignId?.toString(),
      proposedPrice: row.proposedPrice ?? null,
      campaignBudget: row.campaignBudget ?? null,
      dealPaymentId: row.dealPaymentId?.toString() || null,
      paymentStatus: row.paymentStatus || null,
      creatorPayout: row.creatorPayout || null,
      date: row.proposalDate ? new Date(row.proposalDate).toLocaleDateString() : 'N/A',
      creatorMarkedDone: Boolean(row.creatorMarkedDone),
      brandApproved: Boolean(row.brandApproved),
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error in /api/links:", err);
    res.status(500).json({ message: "Database error" });
  }
});
// Вземи всички чатове на текущия потребител
app.get("/api/chats", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rooms] = await pool.query(
      `SELECT 
        cr.id, 
        cr.creator_id, 
        cr.brand_id, 
        cr.created_at,
        p.name, 
        p.avatar, 
        p.handle
      FROM chat_rooms cr
      JOIN profiles p ON p.id = (CASE 
                                   WHEN cr.creator_id = ? THEN cr.brand_id 
                                   ELSE cr.creator_id 
                                 END)
      WHERE cr.creator_id = ? OR cr.brand_id = ?
      ORDER BY cr.updated_at DESC`,
      [userId, userId, userId]
    );

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Вземи съобщенията от конкретен чат
app.get("/api/chats/:roomId/messages", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  try {
    // Проверка дали потребителят е част от стаята
    const [[room]] = await pool.query(
      "SELECT id FROM chat_rooms WHERE id = ? AND (creator_id = ? OR brand_id = ?)",
      [roomId, userId, userId]
    );

    if (!room) return res.status(403).json({ error: "Access denied" });

    const [msgs] = await pool.query(
      "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC LIMIT 100",
      [roomId]
    );
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

app.get("/api/chats/:roomId/partner", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.params;
  try {
    const [[room]] = await pool.query(
      `SELECT creator_id, brand_id FROM chat_rooms WHERE id = ? AND (creator_id = ? OR brand_id = ?)`,
      [roomId, userId, userId]
    );
    if (!room) return res.status(404).json({ error: "Room not found" });
    const partnerId = String(room.creator_id) === String(userId) ? room.brand_id : room.creator_id;
    const [[profile]] = await pool.query(
      `SELECT id, name, handle, avatar FROM profiles WHERE id = ?`,
      [partnerId]
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch partner" });
  }
});

app.post("/api/instagram/connect", authenticate, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  console.log(`[IG CONNECT] Started for User: ${userId}`);

  if (!code) {
    return res.status(400).json({ error: "No code provided in request body" });
  }

  try {
    // 1️. Exchange code for short-lived token
    console.log("[IG CONNECT] Exchanging code for short-lived token...");
    const shortTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        redirect_uri: process.env.IG_REDIRECT_URI, // MUST MATCH NGROK URL EXACTLY
        code: code
      })
    );

    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenRes.ok) {
      console.error("[IG CONNECT] Short-lived token exchange failed:", shortTokenData);
      return res.status(shortTokenRes.status).json(shortTokenData);
    }

    const shortToken = shortTokenData.access_token;
    console.log("[IG CONNECT] Received short-lived token. Exchanging for long-lived...");

    // 2️. Exchange for long-lived token
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortToken
      })
    );

    const longTokenData = await longTokenRes.json();
    if (!longTokenRes.ok) {
      console.error("[IG CONNECT] Long-lived token exchange failed:", longTokenData);
      return res.status(longTokenRes.status).json(longTokenData);
    }

    const longLivedToken = longTokenData.access_token;
    const expiresIn = longTokenData.expires_in;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 3️. Get Pages + IG Business accounts
    console.log("[IG CONNECT] Fetching linked business accounts...");
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?` +
      new URLSearchParams({
        fields: "name,id,instagram_business_account{id,username,name,profile_picture_url}",
        access_token: longLivedToken
      })
    );

    const pagesData = await pagesRes.json();
    if (!pagesRes.ok) {
      console.error("[IG CONNECT] Pages fetch failed:", pagesData);
      return res.status(pagesRes.status).json(pagesData);
    }

    const igAccounts = (pagesData.data || [])
      .map(page => page.instagram_business_account)
      .filter(Boolean);

    if (igAccounts.length === 0) {
      console.warn("[IG CONNECT] No Business Account found for user.");
      return res.status(404).json({
        error: "No Instagram Business Account found.",
        help: "Ensure your IG account is a Professional account and linked to a Facebook Page."
      });
    }

    const selectedIG = igAccounts[0];
    console.log(`[IG CONNECT] Saving account: ${selectedIG.username}`);

    // 4️. Database Insert
    // NOTE: Check if your table uses 'user_id' or 'creator_id' to match your schema
    await pool.query(
      `INSERT INTO instagram_accounts 
      (user_id, ig_user_id, ig_username, ig_name, profile_picture_url, access_token, token_expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        ig_username = VALUES(ig_username),
        ig_name = VALUES(ig_name),
        profile_picture_url = VALUES(profile_picture_url),
        access_token = VALUES(access_token),
        token_expires_at = VALUES(token_expires_at),
        updated_at = CURRENT_TIMESTAMP`,
      [userId, selectedIG.id, selectedIG.username, selectedIG.name || null, selectedIG.profile_picture_url || null, encryptSecret(longLivedToken), expiresAt]
    );

    console.log("[IG CONNECT] Success!");
    return res.json({
      success: true,
      handle: selectedIG.username,
      id: selectedIG.id
    });

  } catch (err) {
    console.error("[IG CONNECT] CRITICAL ERROR:", err);
    // Ensure we ALWAYS send a response so the frontend doesn't hang
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error during connection." });
    }
  }
});

// Add this near your other auth/profile routes
app.get("/auth/instagram/callback", authenticate, async (req, res) => {
  const code = req.query.code;        // Instagram sends ?code=...
  const userId = req.user.id;         // From your JWT authenticate middleware

  if (!code) return res.status(400).send("No code provided by Instagram");

  try {
    // 1️ Exchange code for Short-Lived Token
    const shortTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        redirect_uri: process.env.IG_REDIRECT_URI, // Must match Meta App redirect
        code,
      })
    );
    const shortData = await shortTokenRes.json();
    const shortToken = shortData.access_token;

    if (!shortToken) throw new Error("Failed to get short-lived token");

    // 2️ Exchange for Long-Lived Token
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortToken,
      })
    );
    const longData = await longTokenRes.json();
    const longToken = longData.access_token;

    if (!longToken) throw new Error("Failed to get long-lived token");

    // 3️ Discover IG Business Account linked to user's Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?` +
      new URLSearchParams({
        fields: "name,id,instagram_business_account{id,username,name,profile_picture_url}",
        access_token: longToken,
      })
    );
    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    const igAccount = pages
      .map((p) => p.instagram_business_account)
      .find(Boolean);

    if (!igAccount)
      return res.status(404).send(
        "No Instagram Business Account found. Make sure it's Professional and linked to a Facebook Page."
      );

    // 4️ Insert or update in your instagram_accounts table
    await pool.query(
      `INSERT INTO instagram_accounts 
    (user_id, ig_user_id, ig_username, access_token, token_expires_at, connected_at, updated_at)
   VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 60 DAY), NOW(), NOW())
   ON DUPLICATE KEY UPDATE 
     ig_username = VALUES(ig_username),
     access_token = VALUES(access_token),
     token_expires_at = DATE_ADD(NOW(), INTERVAL 60 DAY),
     updated_at = NOW()`,
      [userId, igAccount.id, igAccount.username, encryptSecret(longToken)]
    );

    // 5️ Redirect back to your frontend or send JSON
    res.redirect(`${process.env.FRONTEND_URL}/profile/${userId}?ig_connected=1`);
    // OR for testing: res.json({ success: true, handle: igAccount.username });
  } catch (err) {
    console.error("Instagram OAuth Callback Error:", err);
    res.status(500).send("Failed to connect Instagram");
  }
});

app.post("/api/instagram/sync", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const [accounts] = await pool.query(
      "SELECT ig_user_id, access_token FROM instagram_accounts WHERE user_id = ?",
      [userId]
    );

    if (accounts.length === 0) return res.status(404).json({ error: "No account linked" });

    const { ig_user_id } = accounts[0];
    const access_token = decryptSecret(accounts[0].access_token);

    // 1. Fetch Profile + Recent Media (last 15 posts)
    const igDataRes = await fetch(
      `https://graph.facebook.com/v21.0/${ig_user_id}?` +
      new URLSearchParams({
        fields: "followers_count,follows_count,media_count,media.limit(15){like_count,comments_count}",
        access_token: access_token
      })
    );

    const igData = await igDataRes.json();
    if (!igDataRes.ok) {
      // Graph error 190 = the access token is permanently invalid (expired,
      // revoked, or the user changed their password). It will never work again,
      // so clear the dead connection — the profile then shows "Connect Instagram"
      // and the user can reconnect — instead of logging a 500 on every sync.
      if (igData?.error?.code === 190) {
        console.warn(`[IG SYNC] Token invalid for user ${userId} (code 190) — clearing stale connection.`);
        await pool.query("DELETE FROM instagram_analytics WHERE ig_user_id = ?", [ig_user_id]);
        await pool.query("DELETE FROM instagram_accounts WHERE ig_user_id = ?", [ig_user_id]);
        await pool.query(
          "UPDATE profiles SET instagram_linked = 0 WHERE id = (SELECT id FROM users WHERE id = ?)",
          [userId]
        );
        return res.status(409).json({
          error: "instagram_reauth_required",
          reconnect: true,
          message: "Your Instagram session expired. Please reconnect your account.",
        });
      }
      throw new Error(JSON.stringify(igData));
    }

    // 2. Calculate Engagement Metrics
    const followers = igData.followers_count || 0;
    const media = igData.media?.data || [];

    let totalLikes = 0;
    let totalComments = 0;

    media.forEach(post => {
      totalLikes += (post.like_count || 0);
      totalComments += (post.comments_count || 0);
    });

    const avgLikes = media.length > 0 ? (totalLikes / media.length) : 0;
    const avgComments = media.length > 0 ? (totalComments / media.length) : 0;

    // Engagement Rate Calculation
    let er = 0;
    if (followers > 0 && media.length > 0) {
      er = ((avgLikes + avgComments) / followers) * 100;
    }

    // 3. Update the analytics table with the new calculated fields
    await pool.query(
      `INSERT INTO instagram_analytics 
        (ig_user_id, followers_count, follows_count, media_count, avg_likes, avg_comments, engagement_rate, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
        followers_count = VALUES(followers_count),
        follows_count = VALUES(follows_count),
        media_count = VALUES(media_count),
        avg_likes = VALUES(avg_likes),
        avg_comments = VALUES(avg_comments),
        engagement_rate = VALUES(engagement_rate),
        last_updated = NOW()`,
      [ig_user_id, followers, igData.follows_count, igData.media_count, avgLikes, avgComments, er]
    );

    await pool.query(
      "UPDATE profiles SET instagram_linked = 1 WHERE id = (SELECT id FROM users WHERE id = ?)",
      [userId]
    );

    return res.json({ success: true, stats: { er: er.toFixed(2), avgLikes: avgLikes.toFixed(0) } });

  } catch (err) {
    console.error("[IG SYNC] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/instagram/analytics/:userId", authenticate, async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT ia.*, acc.ig_username, acc.profile_picture_url, acc.access_token, acc.ig_user_id
       FROM instagram_analytics ia
       JOIN instagram_accounts acc ON ia.ig_user_id = acc.ig_user_id
       WHERE acc.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "No data" });

    let data = rows[0];
    const igToken = decryptSecret(data.access_token);

    try {
      const fbResponse = await fetch(
        `https://graph.facebook.com/v21.0/${data.ig_user_id}?fields=profile_picture_url,username&access_token=${igToken}`
      );
      const freshData = await fbResponse.json();

      if (freshData.profile_picture_url) {
        await pool.query(
          "UPDATE instagram_accounts SET profile_picture_url = ? WHERE ig_user_id = ?",
          [freshData.profile_picture_url, data.ig_user_id]
        );
        // Use the fresh URL for the current response
        data.profile_picture_url = freshData.profile_picture_url;
      }
    } catch (fbErr) {
      console.error("Could not refresh IG picture:", fbErr.message);
    }

    // Never leak the long-lived Graph API access token to the client. It is
    // only needed server-side (above) to refresh the profile picture.
    delete data.access_token;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Only these hosts may be proxied. This blocks SSRF (cloud metadata endpoints,
// localhost, internal services) since the URL comes from the client.
const PROXY_ALLOWED_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
  "fbsbx.com",
];

app.get("/api/instagram/proxy-image", authenticate, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL required");

  let target;
  try {
    target = new URL(String(url));
  } catch {
    return res.status(400).send("Invalid URL");
  }

  const isAllowed =
    target.protocol === "https:" &&
    PROXY_ALLOWED_HOSTS.some(
      (host) => target.hostname === host || target.hostname.endsWith(`.${host}`)
    );

  if (!isAllowed) {
    return res.status(400).send("URL host not allowed");
  }

  try {
    const response = await fetch(target.href);
    const contentType = response.headers.get("content-type") || "";
    // Only forward actual images.
    if (!contentType.startsWith("image/")) {
      return res.status(415).send("Unsupported content type");
    }
    res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send("Error proxying image");
  }
});

app.post("/api/instagram/unlink", authenticate, async (req, res) => {
  const userId = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the IG User ID before we delete the account link
    const [accounts] = await connection.query(
      "SELECT ig_user_id FROM instagram_accounts WHERE user_id = ?",
      [userId]
    );

    if (accounts.length > 0) {
      const igUserId = accounts[0].ig_user_id;

      // 2. Delete analytics data first (Foreign Key hygiene)
      await connection.query(
        "DELETE FROM instagram_analytics WHERE ig_user_id = ?",
        [igUserId]
      );

      // 3. Delete the account connection
      await connection.query(
        "DELETE FROM instagram_accounts WHERE user_id = ?",
        [userId]
      );
    }

    await connection.commit();
    console.log(`[IG UNLINK] Data purged for User: ${userId}`);
    res.json({ success: true, message: "Instagram disconnected successfully." });

  } catch (err) {
    await connection.rollback();
    console.error("[IG UNLINK] Error:", err);
    res.status(500).json({ error: "Failed to unlink account." });
  } finally {
    connection.release();
  }
});

app.post("/api/instagram/deletion-callback", async (req, res) => {
  const { signed_request } = req.body;

  if (!signed_request) {
    return res.status(400).send("No signed request provided.");
  }

  try {
    // 1. Split and verify the signed request
    const [encodedSig, payload] = signed_request.split('.');
    const secret = process.env.FB_APP_SECRET;

    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('hex');
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (sig !== expectedSig) {
      return res.status(400).send("Invalid signature.");
    }

    // 2. Extract the IG User ID provided by Meta
    const igUserId = data.user_id;
    console.log(`[META CALLBACK] Deleting data for IG User: ${igUserId}`);

    // 3. Purge data from both tables
    await pool.query("DELETE FROM instagram_analytics WHERE ig_user_id = ?", [igUserId]);
    await pool.query("DELETE FROM instagram_accounts WHERE ig_user_id = ?", [igUserId]);

    // 4. Respond with the required confirmation URL and code
    // Meta expects a JSON response with a status URL
    const confirmationCode = `DEL_${igUserId}_${Date.now()}`;

    res.json({
      url: `https://mvp.influ-link.com/data-deletion-status?id=${confirmationCode}`,
      confirmation_code: confirmationCode
    });

  } catch (err) {
    console.error("[META CALLBACK] Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Meta "Deauthorize" callback — fired when a user removes the app from their
// Facebook/Instagram settings (distinct from the data-deletion callback above).
// Register this URL in the Meta app dashboard (Facebook Login → Settings →
// Deauthorize Callback URL): https://api.influ-link.com/api/instagram/deauthorize-callback
// We drop the connection + synced insights (same cleanup as manual unlink) but
// keep the user's InfluLink account.
app.post("/api/instagram/deauthorize-callback", async (req, res) => {
  const { signed_request } = req.body;

  if (!signed_request) {
    return res.status(400).send("No signed request provided.");
  }

  try {
    // Verify the signed request exactly like the deletion callback.
    const [encodedSig, payload] = signed_request.split(".");
    const secret = process.env.FB_APP_SECRET;

    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("hex");
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());

    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (sig !== expectedSig) {
      return res.status(400).send("Invalid signature.");
    }

    const igUserId = data.user_id;
    console.log(`[META DEAUTH] App removed — unlinking IG user: ${igUserId}`);

    await pool.query("DELETE FROM instagram_analytics WHERE ig_user_id = ?", [igUserId]);
    await pool.query("DELETE FROM instagram_accounts WHERE ig_user_id = ?", [igUserId]);

    // Meta expects a 200 acknowledgement.
    res.sendStatus(200);
  } catch (err) {
    console.error("[META DEAUTH] Error:", err);
    res.status(400).send("Invalid request.");
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://api.influ-link.com/api/auth/google/callback",
  passReqToCallback: true
},
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const state = req.query.state ? JSON.parse(req.query.state) : {};
      const role = state.role || 'creator';

      const [users] = await pool.execute(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [profile.id, profile.emails[0].value]
      );

      let user = users[0];

      if (!user) {
        // 1. New User: Insert with the role from the button they clicked
        const [result] = await pool.execute(
          `INSERT INTO users (name, email, google_id, account_type, created_at, gdpr_consent, email_verified)
           VALUES (?, ?, ?, ?, NOW(), 1, 1)`,
          [profile.displayName, profile.emails[0].value, profile.id, role]
        );
        const [newUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUser[0];
      } else {
        // 2. Existing User: Update google_id and account_type
        // We update account_type in case an existing email user is now choosing their role via the Google flow
        await pool.execute(
          'UPDATE users SET google_id = ?, account_type = ? WHERE id = ?',
          [profile.id, role, user.id]
        );
        user.google_id = profile.id;
        user.account_type = role;
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Route 1: The Initial Trigger
app.get('/api/auth/google', (req, res, next) => {
  // Capture whether they are on the brand or creator path
  const { role } = req.query; // Expecting 'creator' or 'brand'
  const state = JSON.stringify({ role: role || 'creator' });

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const state = req.query.state ? JSON.parse(req.query.state) : {};
      const role = state.role || 'creator';

      const token = jwt.sign(
        { id: req.user.id, accountType: req.user.account_type },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        domain: '.influ-link.com',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // 1. Set a temporary cookie just for the transfer
      res.cookie('google_exchange_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 5 * 60 * 1000 // Valid for only 5 minutes
      });

      const [rows] = await pool.execute('SELECT handle FROM profiles WHERE id = ?', [req.user.id]);
      const isProfileComplete = rows[0] && rows[0].handle;

      // 2. Redirect with a flag, but NO token in the string
      if (isProfileComplete) {
        res.redirect(`${process.env.FRONTEND_URL}/profile/me?fromGoogle=true`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/register/${role}?fromGoogle=true&isGoogleAuth=true`);
      }
    } catch (err) {
      console.error("Google Callback Error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=true`);
    }
  }
);

app.get('/api/auth/exchange-google-token', async (req, res) => {
  const token = req.cookies.google_exchange_token;

  if (!token) {
    return res.status(401).json({ message: "No exchange token found" });
  }

  // Clear the cookie immediately after reading it (one-time use)
  res.clearCookie('google_exchange_token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0) return res.status(404).send();

    // Send token in JSON body, which is safe from URL history/Burp URL logs
    res.json({
      token,
      user: rows[0]
    });
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post('/api/payouts/setup', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // From your auth cookie/session

    // 1. Get user from DB (mysql2 placeholders + result shape)
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    let stripeAccountId = userRows[0]?.stripe_account_id;

    // 2. Create the Express Account if it doesn't exist yet
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // 3. Save the new ID to your database
      await pool.query(
        'UPDATE users SET stripe_account_id = ? WHERE id = ?',
        [stripeAccountId, userId]
      );
    }

    // 4. Generate the Onboarding Link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `https://mvp.influ-link.com/settings/payouts?status=refresh`,
      return_url: `https://mvp.influ-link.com/settings/payouts?status=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

app.post('/api/payouts/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const { stripe_account_id, stripe_onboarding_complete } = rows[0];

    if (!stripe_account_id) return res.json({ complete: false });

    // Ask Stripe directly if onboarding is done
    const account = await stripe.accounts.retrieve(stripe_account_id);
    console.log("[STRIPE STATUS]", {
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      stripe_account_id
    });
    const complete = account.details_submitted && account.charges_enabled;

    if (complete && !stripe_onboarding_complete) {
      await pool.query(
        'UPDATE users SET stripe_onboarding_complete = 1 WHERE id = ?',
        [userId]
      );
    }

    res.json({ complete });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ error: "Failed to check status" });
  }
});

app.post('/api/payouts/dashboard-link', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT stripe_account_id FROM users WHERE id = ?', [userId]);
    const stripeAccountId = rows[0]?.stripe_account_id;

    if (!stripeAccountId) return res.status(400).json({ error: "No Stripe account found" });

    // This creates a single-use URL to the Stripe Express Dashboard
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

    res.json({ url: loginLink.url });
  } catch (err) {
    console.error("Dashboard link error:", err);
    res.status(500).json({ error: err.message || "Could not create dashboard link" });
  }
});

// POST /api/payouts/stripe-action
app.post('/api/payouts/stripe-action', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    let { stripe_account_id, stripe_onboarding_complete } = rows[0];

    if (!stripe_account_id) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripe_account_id = account.id;
      await pool.query('UPDATE users SET stripe_account_id = ? WHERE id = ?', [stripe_account_id, userId]);
    }

    // Dynamic base URL from env (falls back to localhost only in dev)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!stripe_onboarding_complete) {
      const link = await stripe.accountLinks.create({
        account: stripe_account_id,
        refresh_url: `${baseUrl}/profile/me?stripe=refresh`,
        return_url: `${baseUrl}/profile/me?stripe=success`,
        type: 'account_onboarding',
      });
      return res.json({ url: link.url });
    } else {
      const loginLink = await stripe.accounts.createLoginLink(stripe_account_id);
      return res.json({ url: loginLink.url });
    }
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    const secrets = [
      process.env.STRIPE_WEBHOOK_SECRET,
      process.env.STRIPE_WEBHOOK_SECRET_PAYMENTS,
    ].filter(Boolean);

    for (const secret of secrets) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
        break;
      } catch (err) {
        // Signature didn't match this secret; try the next one.
      }
    }

    if (!event) {
      return res.status(400).send('Webhook signature verification failed');
    }

    if (event.type === 'account.updated') {
      const account = event.data.object;
      if (account.details_submitted) {
        await pool.query(
          'UPDATE users SET stripe_onboarding_complete = 1 WHERE stripe_account_id = ?',
          [account.id]
        );
        console.log(`[STRIPE] User ${account.id} is now onboarded!`);
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Reconcile the ACTUAL Stripe fee for this charge. The balance_transaction's
      // fee/net reflect the real card type + location (EEA vs UK vs international),
      // which we can't know upfront. Stored for accurate books; commission stays flat.
      let actualFee = null, actualNet = null;
      // `latest_charge` on newer API versions; `charges.data[0]` on older ones.
      const chargeId = paymentIntent.latest_charge
        || paymentIntent.charges?.data?.[0]?.id
        || null;
      try {
        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] });
          const bt = charge.balance_transaction;
          if (bt) {
            actualFee = bt.fee / 100;
            actualNet = bt.net / 100;
          }
        }
      } catch (e) {
        console.error('[WEBHOOK] fee reconcile failed:', e.message);
      }

      // Store the charge id so the release transfer can use source_transaction,
      // which lets the payout draw from this specific charge even before the
      // platform balance has settled (avoids "insufficient available funds").
      await pool.query(
        'UPDATE deal_payments SET status = ?, stripe_charge_id = ?, stripe_fee_actual = ?, stripe_net = ? WHERE stripe_payment_intent_id = ?',
        ['paid', chargeId, actualFee, actualNet, paymentIntent.id]
      );
      console.log(`[PAYMENT] ${paymentIntent.id} marked as paid (fee: ${actualFee ?? 'n/a'})`);
    }

    // ── Brand subscription lifecycle ──────────────────────────────────────
    // Every state change flows through the subscription object so local state
    // and Stripe can't diverge. checkout.session.completed only fires once, so
    // we also handle customer.subscription.* for renewals, upgrades and cancels.
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscriptionFromStripe(sub);
          console.log(`[BILLING] Subscription ${sub.id} activated for customer ${sub.customer}`);
        }
      } else if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted"
      ) {
        await upsertSubscriptionFromStripe(event.data.object);
        console.log(`[BILLING] ${event.type} → ${event.data.object.id} (${event.data.object.status})`);
      } else if (event.type === "invoice.payment_failed") {
        // A renewal (or the first) charge failed. Stripe's Smart Retries will
        // keep trying; we just tell the brand, with the next attempt date, and
        // let the accompanying subscription.updated open the grace window.
        const invoice = event.data.object;
        if (invoice.subscription) {
          const [rows] = await pool.query(
            "SELECT user_id FROM brand_subscriptions WHERE stripe_customer_id = ?",
            [invoice.customer]
          );
          const userId = rows[0]?.user_id;
          const nextTs = invoice.next_payment_attempt;
          const when = nextTs ? toMysqlDate(nextTs * 1000) : null;
          await notifyBilling(
            userId,
            "billing_payment_failed",
            "Payment didn't go through",
            when
              ? `We couldn't charge your card. We'll retry on ${when}. Update your card to avoid losing access.`
              : "We couldn't charge your card. Please update your payment method to keep your subscription."
          );
          console.log(`[BILLING] invoice.payment_failed for customer ${invoice.customer} (next: ${when || "n/a"})`);
        }
      } else if (event.type === "invoice.payment_succeeded") {
        // Successful renewal. State (period end, status) is carried by the
        // subscription.updated event; nothing else to do here — the "recovered"
        // notification is fired from upsert on the past_due → active transition.
        const invoice = event.data.object;
        if (invoice.billing_reason === "subscription_cycle") {
          console.log(`[BILLING] renewal paid for customer ${invoice.customer}`);
        }
      }
    } catch (err) {
      // A subscription event failed to persist (e.g. a transient DB error).
      // Return 500 so Stripe RETRIES — losing subscription state silently would
      // mean a paying customer with the wrong access. This is safe: subscription
      // events and the escrow events above are different event types, so a
      // single delivery never touches both, and re-processing is idempotent
      // (state is upserted; notifications are gated on the prior→new transition).
      console.error("[BILLING] subscription webhook handling failed, asking Stripe to retry:", err);
      return res.status(500).json({ error: "subscription_handler_failed" });
    }

    res.json({ received: true });
  }
);
// Creator commission is tiered by the creator's lifetime paid-out earnings
// (mirrors the public Pricing page):
//     < €1,000        → 15%   (New Creator)
//     €1,000–€10,000  → 10%   (Pro Creator)
//     ≥ €10,000       →  7%   (Top Creator)
// Ordered high→low so the first matching threshold wins.
const COMMISSION_TIERS = [
  { minEarnings: 10000, percent: 7 },
  { minEarnings: 1000, percent: 10 },
  { minEarnings: 0, percent: 15 },
];

function commissionPercentForEarnings(lifetimeEarnings) {
  const earned = Number(lifetimeEarnings) || 0;
  const tier = COMMISSION_TIERS.find((t) => earned >= t.minEarnings);
  return tier ? tier.percent : 15; // 15% = entry tier / safe default
}

// Sum of everything a creator has actually been paid out (released deals only).
async function getCreatorLifetimeEarnings(creatorId) {
  const [rows] = await pool.query(
    "SELECT COALESCE(SUM(creator_payout), 0) AS lifetimeEarnings FROM deal_payments WHERE creator_user_id = ? AND status = 'transferred'",
    [creatorId]
  );
  return Number(rows[0]?.lifetimeEarnings || 0);
}

app.post('/api/payments/create-intent', authenticate, async (req, res) => {
  try {
    const { dealAmount, creatorId, campaignId } = req.body;
    const brandId = req.user.id; // ← add

    // Provisional commission shown to the brand at checkout, based on the
    // creator's current lifetime-earnings tier. This is only an ESTIMATE — the
    // final commission is recomputed at release time in attemptRelease(), since
    // the creator's tier (or the deal itself) may change before payout.
    const lifetimeEarnings = await getCreatorLifetimeEarnings(creatorId);
    const commissionPercent = commissionPercentForEarnings(lifetimeEarnings);

    const [creatorRows] = await pool.query(
      'SELECT stripe_account_id FROM users WHERE id = ?', [creatorId]
    );
    const creatorStripeId = creatorRows[0]?.stripe_account_id;
    if (!creatorStripeId) {
      return res.status(400).json({ error: "Creator has not set up payouts yet" });
    }

    const deal = Number(dealAmount);
    if (deal < 0.50) {
      return res.status(400).json({ error: "Minimum deal amount is $0.50" });
    }

    // UPFRONT ESTIMATE ONLY. Stripe doesn't expose the exact fee before the card is
    // entered, so we estimate at the standard EEA consumer-card rate (1.5% + €0.25)
    // and gross up so the brand covers the fee-on-fee. The REAL fee (which reflects
    // the actual card type + location) is reconciled in the payment_intent.succeeded
    // webhook and stored in stripe_fee_actual. The platform absorbs any estimate gap;
    // the commission below stays flat.
    const STRIPE_PCT = 0.015;
    const STRIPE_FIXED = 0.25;
    const stripeFee = Math.round(((deal * STRIPE_PCT + STRIPE_FIXED) / (1 - STRIPE_PCT)) * 100) / 100;
    const commissionAmount = Math.round((deal * commissionPercent / 100) * 100) / 100;
    const totalCharged = Math.round((deal + stripeFee) * 100);
    const creatorPayout = Math.round((deal - commissionAmount) * 100) / 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCharged,
      currency: 'eur',
      // Card only. Alternative methods (MB WAY, Multibanco, etc.) are async/delayed
      // and don't fit immediate escrow holds.
      payment_method_types: ['card'],
      metadata: {
        campaignId,
        creatorId,
        brandId,                // ← add
        commissionPercent,
        commissionAmount,
        stripeFee,
        creatorPayout,
        creatorStripeId,
      },
    });

    // ← Insert into deal_payments
    await pool.query(
      `INSERT INTO deal_payments 
        (campaign_id, brand_user_id, creator_user_id, deal_amount, commission_percent, commission_amount, stripe_fee, total_charged, creator_payout, stripe_payment_intent_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [campaignId, brandId, creatorId, deal, commissionPercent, commissionAmount, stripeFee, totalCharged / 100, creatorPayout, paymentIntent.id]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      breakdown: {
        dealAmount: deal,
        stripeFee,
        commissionAmount,
        commissionPercent,
        totalCharged: totalCharged / 100,
        creatorPayout,
        currency: 'eur',
      }
    });
  } catch (err) {
    console.error("Payment intent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Brand approval. Records the brand's approval and releases the escrowed funds
// only if the creator has also marked the campaign finished (handled by
// attemptRelease). Otherwise it waits for the creator's completion.
app.post('/api/payments/release', authenticate, async (req, res) => {
  try {
    const { dealPaymentId } = req.body;
    const brandId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM deal_payments WHERE id = ? AND brand_user_id = ?',
      [dealPaymentId, brandId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = rows[0];
    if (payment.status === 'transferred') {
      return res.status(400).json({ error: "Funds already released" });
    }
    if (payment.status !== 'paid') {
      return res.status(400).json({ error: "Payment is not funded yet" });
    }

    // Record the brand's approval
    await pool.query('UPDATE deal_payments SET brand_approved = 1 WHERE id = ?', [dealPaymentId]);

    const result = await attemptRelease(dealPaymentId, brandId);
    if (result.released) {
      console.log(`[RELEASE] Transferred $${payment.creator_payout} (deal ${payment.id})`);
      return res.json({ success: true, released: true, transferId: result.transferId });
    }

    // Approved, but waiting on the creator to mark the work finished
    await createNotification(pool, {
      userId: payment.creator_user_id,
      type: 'brand_approved',
      title: 'Brand approved your deal',
      message: 'Mark the campaign as finished to receive your payment.',
      entityType: 'deal_payment',
      entityId: dealPaymentId,
    });
    res.json({ success: true, released: false, brandApproved: true });

  } catch (err) {
    console.error("Release error:", err);
    res.status(500).json({ error: err.message });
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id;
  socket.join(`user_${userId}`); // CRITICAL: Allows personal notifications

  socket.on("join_room", (roomId) => {
    socket.join(`room_${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const { roomId, text, receiverId } = data;
    try {
      const [result] = await pool.query(
        "INSERT INTO messages (room_id, sender_id, text) VALUES (?, ?, ?)",
        [roomId, userId, text]
      );

      await pool.query(
        "UPDATE chat_rooms SET last_message = ?, last_message_at = NOW() WHERE id = ?",
        [text, roomId]
      );

      const newMessage = {
        id: result.insertId,
        room_id: roomId,
        sender_id: userId,
        text,
        is_read: 0,
        created_at: new Date()
      };

      io.to(`room_${roomId}`).emit("receive_message", newMessage);

      // ✅ Save notification to DB
      await createNotification(pool, {
        userId: receiverId,
        type: "message",
        title: "New message",
        message: text.length > 60 ? text.substring(0, 60) + "..." : text,
        entityType: "chat_room",
        entityId: roomId,
      });

      // Notify receiver via socket
      io.to(`user_${receiverId}`).emit("new_chat_notification", {
        fromId: userId,
        text: "sent you a message"
      });

    } catch (err) {
      console.error("Chat error:", err);
    }
  });
});

// =======================
// CONTACT FORM
// =======================
app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    // Honeypot: silently accept obvious bots so they don't retry, but send nothing.
    if (isHoneypotTripped(req.body) || isSubmittedTooFast(req.body)) {
      logSecurityEvent("honeypot_contact", req, {});
      return res.status(200).json({ message: "ok" });
    }

    const firstName = (req.body.firstName || "").toString().trim();
    const lastName = (req.body.lastName || "").toString().trim();
    const handle = (req.body.handle || "").toString().trim();
    const email = (req.body.email || "").toString().trim();
    const phone = (req.body.phone || "").toString().trim();
    const dialCode = (req.body.dialCode || "").toString().trim();
    const message = (req.body.message || "").toString().trim();
    const role = req.body.role === "brand" ? "brand" : "creator";

    if (!firstName || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }
    // Basic email sanity check + length guards against oversized payloads.
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    if (!emailOk) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (firstName.length > 100 || lastName.length > 100 || handle.length > 150 || message.length > 5000) {
      return res.status(400).json({ message: "Invalid submission." });
    }

    if (!resend) {
      console.error("Contact form: RESEND_API_KEY not configured.");
      return res.status(503).json({ message: "Contact form is temporarily unavailable." });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const phoneLine = phone ? `${dialCode} ${phone}`.trim() : "—";
    const roleLabel = role === "brand" ? "Brand" : "Creator";

    const textBody = [
      `New contact request from InfluLink`,
      ``,
      `Joining as: ${roleLabel}`,
      `Name: ${fullName}`,
      `Job title / handle: ${handle || "—"}`,
      `Email: ${email}`,
      `Phone: ${phoneLine}`,
      ``,
      `Message:`,
      message,
    ].join("\n");

    const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
    const htmlBody = `
      <h2>New contact request from InfluLink</h2>
      <p><strong>Joining as:</strong> ${esc(roleLabel)}</p>
      <p><strong>Name:</strong> ${esc(fullName)}</p>
      <p><strong>Job title / handle:</strong> ${esc(handle || "—")}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Phone:</strong> ${esc(phoneLine)}</p>
      <p><strong>Message:</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>
    `;

    const mailResult = await sendEmail({
      to: process.env.CONTACT_EMAIL_TO || process.env.ALERT_EMAIL_TO,
      replyTo: email,
      subject: `New ${roleLabel} inquiry — ${fullName}`,
      text: textBody,
      html: htmlBody,
    });
    if (mailResult.error || mailResult.skipped) {
      return res.status(502).json({ message: "Failed to send message." });
    }

    return res.status(200).json({ message: "Message sent." });
  } catch (err) {
    console.error("Error in /api/contact:", err);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

// DISABLED: migrateExistingConnections() fabricated participation records by
// assigning every creator to every campaign with RANDOM earnings/reach on each
// boot. It must never run against production data. Keep the function for
// reference/local seeding only, but do not call it on startup.
// migrateExistingConnections()
//   .then(() => console.log("✅ Migration check completed"))
//   .catch(err => console.error("❌ Migration failed:", err));

ensureEscrowColumns()
  .then(() => console.log("✅ Escrow columns check completed"))
  .catch(err => console.error("❌ Escrow columns migration failed:", err));

ensureCampaignBriefColumns()
  .then(() => console.log("✅ Campaign brief columns check completed"))
  .catch(err => console.error("❌ Campaign brief columns migration failed:", err));

ensureCreatorPlansTable()
  .then(() => console.log("✅ Creator plans table check completed"))
  .catch(err => console.error("❌ Creator plans migration failed:", err));

// Brand billing: schema first, then the Stripe catalog (needs the tables and a
// live key). Chained so the catalog never runs against missing tables.
ensureBrandBillingSchema()
  .then(() => {
    console.log("✅ Brand billing schema check completed");
    return ensureBrandPlanCatalog();
  })
  .then(() => console.log("✅ Brand plan catalog check completed"))
  .catch(err => console.error("❌ Brand billing migration failed:", err));

ensureEmailVerificationSchema()
  .then(() => console.log("✅ Email verification schema check completed"))
  .catch(err => console.error("❌ Email verification migration failed:", err));

// One-time (idempotent) encryption of any Instagram tokens still stored in
// plaintext. Only runs when ENCRYPTION_KEY is set; skips already-encrypted rows.
async function encryptExistingTokens() {
  if (!ENC_KEY) return;
  try {
    // Encrypted tokens are ~30% longer than the raw token. Make sure the column
    // can hold them (widen a small VARCHAR to TEXT) before writing ciphertext,
    // otherwise MySQL would silently truncate and corrupt the value.
    const [cols] = await pool.query(
      `SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'instagram_accounts' AND COLUMN_NAME = 'access_token'`,
      [process.env.DB_DATABASE]
    );
    const dtype = cols[0]?.DATA_TYPE?.toLowerCase();
    const maxLen = cols[0]?.CHARACTER_MAXIMUM_LENGTH;
    const isTextLike = dtype && ["text", "mediumtext", "longtext"].includes(dtype);
    if (!isTextLike && (!maxLen || maxLen < 1024)) {
      await pool.query("ALTER TABLE instagram_accounts MODIFY access_token TEXT");
      console.log("[CRYPTO] Widened access_token column to TEXT for encrypted values.");
    }

    const [rows] = await pool.query(
      "SELECT ig_user_id, access_token FROM instagram_accounts WHERE access_token IS NOT NULL AND access_token NOT LIKE 'enc:v1:%'"
    );
    let migrated = 0;
    for (const row of rows) {
      const enc = encryptSecret(row.access_token);
      if (enc && enc !== row.access_token) {
        await pool.query(
          "UPDATE instagram_accounts SET access_token = ? WHERE ig_user_id = ?",
          [enc, row.ig_user_id]
        );
        migrated++;
      }
    }
    if (migrated) console.log(`[CRYPTO] Encrypted ${migrated} existing Instagram token(s) at rest.`);
  } catch (err) {
    console.error("[CRYPTO] token encryption migration failed:", err.message);
  }
}
encryptExistingTokens();

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res) => {
    // Defense-in-depth against stored XSS: never let the browser sniff a
    // user-uploaded file into an executable type, and forbid inline HTML/JS.
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  },
}));

// =======================
// START SERVER
// =======================
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // One-line config summary so `pm2 logs` shows the effective go-live state at a
  // glance right after a restart. No secrets are printed — only whether each is set.
  const key = process.env.STRIPE_SECRET_KEY || "";
  const stripeMode = key.startsWith("sk_live_") ? "LIVE" : key.startsWith("sk_test_") ? "TEST" : "OFF (no key)";
  const stripeWebhooks =
    [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_WEBHOOK_SECRET_PAYMENTS].filter(Boolean).length;
  const mail = process.env.RESEND_API_KEY
    ? `configured (from: ${process.env.MAIL_FROM || "InfluLink <onboarding@resend.dev>"})`
    : "OFF — verification emails will NOT send";
  const meta = process.env.FB_APP_ID && process.env.FB_APP_SECRET ? "configured" : "OFF";
  console.log(
    `⚙️  [BOOT] Stripe: ${stripeMode} (${stripeWebhooks}/2 webhook secrets) | ` +
    `brand billing: ${BRANDS_ENABLED ? "ON" : "OFF"} | ` +
    `mail: ${mail} | Meta/IG: ${meta} | ` +
    `encryption key: ${process.env.ENCRYPTION_KEY ? "set" : "MISSING"}`
  );
});

// ── Resilience ──────────────────────────────────────────────────────────────
// pm2 restarts on a hard crash, but a bare process can drop in-flight requests
// and leave DB/Redis connections dangling. These handlers log richly first,
// drain on shutdown signals, and turn a fatal error into a clean restart.
let shuttingDown = false;
async function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.warn(`[SHUTDOWN] ${signal} — draining...`);

  // Stop accepting new connections. Socket.io keeps sockets open, so don't wait
  // on close forever — a timer force-exits if draining stalls.
  httpServer.close(() => console.warn("[SHUTDOWN] HTTP server closed"));
  const force = setTimeout(() => {
    console.error("[SHUTDOWN] drain timed out — forcing exit");
    process.exit(1);
  }, 10000);
  force.unref();

  try { await pool.end(); } catch (e) { console.error("[SHUTDOWN] pool:", e.message); }
  try { await pubClient.quit(); } catch (e) { /* already closed */ }
  try { await subClient.quit(); } catch (e) { /* already closed */ }

  clearTimeout(force);
  console.warn("[SHUTDOWN] clean exit");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// An uncaught exception leaves the process in an undefined state — log it and
// exit so pm2 restarts on solid ground rather than limping on corrupted memory.
process.on("uncaughtException", (err) => {
  console.error("[FATAL] uncaughtException:", err);
  gracefulShutdown("uncaughtException");
});

// An unhandled rejection is almost always a missing try/catch or await in a
// route — that one request already failed. Log it loudly (so the bug surfaces)
// but keep serving; taking the whole site down over one bad request is worse.
process.on("unhandledRejection", (reason) => {
  console.error("[WARN] unhandledRejection:", reason);
});
