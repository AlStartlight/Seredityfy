const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

export async function sendVerificationEmail({ email, name, token }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.com';

  if (!serviceId || !templateId || !userId) {
    console.warn('[email] EmailJS not configured — skipping email send');
    return { sent: false, reason: 'EmailJS not configured' };
  }

  const verifyLink = `${siteUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    accessToken: privateKey,
    template_params: {
      to_email: email,
      to_name: name || 'there',
      verify_link: verifyLink,
      site_name: 'Seredityfy',
    },
  };

  const res = await fetch(EMAILJS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[email] EmailJS send failed:', res.status, text);
    return { sent: false, reason: `Email delivery failed (${res.status})` };
  }

  return { sent: true };
}
