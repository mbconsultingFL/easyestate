import { Resend } from 'resend'

/**
 * Thin wrapper around Resend for transactional email.
 *
 * Design choices worth remembering:
 *  - Emails are ALWAYS fire-and-forget from the caller's perspective. A
 *    registration should never 500 because SendGrid/Resend blipped. Callers
 *    can `await` the promise if they want, but a rejected promise is
 *    handled internally and turned into a `{ ok: false, error }` result.
 *  - If `RESEND_API_KEY` is not set (local dev, PR previews without the
 *    secret, etc.) we log and return `{ ok: false, skipped: true }` instead
 *    of throwing. This keeps the app functional in environments where
 *    transactional email isn't configured.
 *  - The `from` address is configurable via `RESEND_FROM`. If unset we fall
 *    back to Resend's sandbox sender (`onboarding@resend.dev`) which works
 *    without domain verification — good for first-run, but replace it with
 *    a verified domain before relying on deliverability.
 */

type SendResult =
  | { ok: true; id: string | undefined }
  | { ok: false; skipped?: boolean; error: string }

let cachedClient: Resend | null = null
function getClient(): Resend | null {
  if (cachedClient) return cachedClient
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  cachedClient = new Resend(key)
  return cachedClient
}

function fromAddress(): string {
  return process.env.RESEND_FROM || 'EasyEstatePlan <onboarding@resend.dev>'
}

async function send(args: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<SendResult> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', args.to)
    return { ok: false, skipped: true, error: 'RESEND_API_KEY not set' }
  }
  try {
    const { data, error } = await client.emails.send({
      from: fromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    })
    if (error) {
      console.error('[email] send failed:', error)
      return { ok: false, error: error.message ?? 'unknown Resend error' }
    }
    return { ok: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] send threw:', err)
    return { ok: false, error: message }
  }
}

/**
 * Welcome email sent right after registration succeeds. The copy is
 * intentionally short — the primary CTA is back into the app to start the
 * POA flow.
 */
export async function sendWelcomeEmail(
  to: string,
  name: string | null
): Promise<SendResult> {
  const firstName = (name || '').trim().split(/\s+/)[0] || 'there'
  const appUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
    'https://easyestateplan.netlify.app'
  const dashboardUrl = `${appUrl}/dashboard`

  const subject = 'Welcome to EasyEstatePlan'
  const text =
    `Hi ${firstName},\n\n` +
    `Thanks for creating your EasyEstatePlan account. You can start building ` +
    `your Healthcare Power of Attorney any time — it's free, and you can ` +
    `save and come back whenever you want.\n\n` +
    `Jump back in: ${dashboardUrl}\n\n` +
    `— EasyEstatePlan\n`

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
            <tr>
              <td style="text-align:center;padding-bottom:24px;">
                <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:#4f46e5;color:#ffffff;font-weight:700;font-size:22px;line-height:48px;">E</div>
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;">Welcome, ${escapeHtml(firstName)}.</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#374151;">
                  Your EasyEstatePlan account is ready. You can start building your Healthcare Power of Attorney whenever you're ready — it's free, and your progress saves automatically.
                </p>
                <p style="margin:24px 0;text-align:center;">
                  <a href="${dashboardUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">Go to your dashboard</a>
                </p>
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  If you didn't create this account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">EasyEstatePlan</p>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return send({ to, subject, html, text })
}

/** Minimal HTML escape for the name we interpolate into the template. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
