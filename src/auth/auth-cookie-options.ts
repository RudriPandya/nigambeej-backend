import type { CookieOptions } from 'express';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Auth cookie domain for split frontend/API hosts:
 * set COOKIE_DOMAIN to the registrable parent, e.g. `.hostingersite.com` (API preview + cookie scope).
 *
 * Production uses SameSite=None + Secure so credentialed requests work when the UI is on a
 * different site than the API (e.g. https://nigambeej.com → https://*.hostingersite.com).
 * SameSite=Lax would NOT send the cookie on those cross-site fetches → 401 on /auth/me.
 */
function normalizeCookieDomain(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  return t.startsWith('.') ? t : `.${t}`;
}

export function getAuthCookieSetOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: DAY_MS,
      path: '/',
    };
  }

  const domain = normalizeCookieDomain(process.env.COOKIE_DOMAIN);
  return {
    httpOnly: true,
    maxAge: DAY_MS,
    path: '/',
    secure: true,
    sameSite: 'none',
    ...(domain ? { domain } : {}),
  };
}

/** Options must match set/clear cookie attributes. */
export function getAuthCookieClearOptions(): Pick<
  CookieOptions,
  'path' | 'domain' | 'sameSite' | 'secure'
> {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    return {
      path: '/',
      sameSite: 'lax',
      secure: false,
    };
  }

  const domain = normalizeCookieDomain(process.env.COOKIE_DOMAIN);
  return {
    path: '/',
    secure: true,
    sameSite: 'none',
    ...(domain ? { domain } : {}),
  };
}
