// One-off test of the Resend email path used by the security alerter + contact
// form. Sends over HTTPS (port 443), so DigitalOcean's SMTP block doesn't apply.
//
// Run where RESEND_API_KEY is set (the droplet .env), e.g.:
//     node send-test-email.mjs
//
// NOTE: with the default MAIL_FROM (onboarding@resend.dev), Resend only delivers
// to the email address that owns the Resend account until you verify a domain.
import "dotenv/config";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM || "InfluLink <onboarding@resend.dev>";
const to = process.env.ALERT_EMAIL_TO || "goshoeprase@gmail.com";

if (!apiKey) {
  console.error("❌ RESEND_API_KEY not set in .env — cannot send.");
  process.exit(1);
}

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "[influ-link] Security alert — test email",
  text:
    "This is a test of the influ-link Resend email path.\n\n" +
    "If you received this, security alerts and the contact form can send email.\n\n" +
    `Sent: ${new Date().toISOString()}\n`,
});

if (error) {
  console.error("❌ Send failed:", error);
  process.exit(1);
}

console.log(`✅ Test email sent to ${to} via Resend. id: ${data?.id}`);
