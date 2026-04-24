const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Attempt to send a verification email via EmailJS from the server side.
 *
 * EmailJS REST API requires a private key for server-side (non-browser) calls.
 * If the private key is missing or the account is on a plan that blocks it,
 * EmailJS returns 403. In that case we set `clientFallback: true` so the
 * caller can return the token to the browser and let the client send via
 * EmailJS directly (browser has the correct Origin header — no key needed).
 */
export async function sendVerificationEmail({ email, name, token }) {
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId     = process.env.EMAILJS_USER_ID;       // public key
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;   // required server-side
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.art';

  // --- env guard ---------------------------------------------------------
  if (!serviceId || !templateId || !userId) {
    console.warn('[email] EmailJS env vars incomplete (SERVICE_ID / TEMPLATE_ID / USER_ID)');
    return { sent: false, reason: 'not_configured', clientFallback: true };
  }

  if (!privateKey) {
    // No private key → server-side call will 403; skip and let client handle it.
    console.warn('[email] EMAILJS_PRIVATE_KEY not set — using client-side fallback');
    return { sent: false, reason: 'no_private_key', clientFallback: true };
  }

  // --- build verify link -------------------------------------------------
  const verifyLink = `${siteUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  // --- call EmailJS REST API ---------------------------------------------
  try {
    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: templateId,
        user_id:     userId,
        accessToken: privateKey,
        template_params: {
          to_email:    email,
          to_name:     name || 'there',
          verify_link: verifyLink,
          site_name:   'Seredityfy',
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] EmailJS ${res.status}: ${body}`);
      // 403 = private key wrong / plan restriction → let client retry
      return { sent: false, reason: `EmailJS error ${res.status}`, clientFallback: res.status === 403 };
    }

    return { sent: true };
  } catch (err) {
    console.error('[email] EmailJS network error:', err.message);
    return { sent: false, reason: err.message, clientFallback: true };
  }
}
