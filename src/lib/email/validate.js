import { promises as dns } from 'dns';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'maildrop.cc', 'inboxbear.com', 'dispostable.com',
  '10minutemail.com', 'trashmail.com', 'temp-mail.org',
];

export async function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  const domain = normalized.split('@')[1];

  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' };
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'Email domain does not accept mail' };
    }
  } catch {
    return { valid: false, reason: 'Email domain could not be verified' };
  }

  return { valid: true };
}
