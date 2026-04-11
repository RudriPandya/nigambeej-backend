import type { CookieOptions } from 'express';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Auth cookie domain for split frontend/API hosts:
 * set COOKIE_DOMAIN to the registrable parent, e.g. `.hostingersite.com` or `.nigambeej.com`,
 * so `Set-Cookie` from the API is visible to both subdomains.
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
    ...(domain
      ? { domain, sameSite: 'lax' as const }
      : { sameSite: 'none' as const }),
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
    ...(domain
      ? { domain, sameSite: 'lax' as const }
      : { sameSite: 'none' as const }),
  };
}
