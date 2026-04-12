import { BadRequestException } from '@nestjs/common';

const TEXT_FIELDS = ['title', 'para1', 'para2', 'years_label'] as const;

export const ABOUT_MAX = {
  years: 48,
  title: 400,
  para1: 12000,
  para2: 12000,
  years_label: 240,
} as const;

const REQUIRED_ABOUT_KEYS = [
  'about_years',
  'about_en_title',
  'about_en_para1',
  'about_en_para2',
  'about_en_years_label',
] as const;

function stringifyBody(body: Record<string, unknown>): Record<string, string> {
  const str: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    str[k] = v === undefined || v === null ? '' : String(v);
  }
  return str;
}

export function payloadTouchesAboutSection(body: Record<string, unknown>): boolean {
  if (!body || typeof body !== 'object') return false;
  return Object.keys(body).some(
    (k) => k.startsWith('about_') && k !== 'about_image',
  );
}

const EN_LABELS: Record<string, string> = {
  about_en_title: 'English title',
  about_en_para1: 'English paragraph 1',
  about_en_para2: 'English paragraph 2',
  about_en_years_label: 'English years badge label',
};

/**
 * When the batch includes any About Us key, validates required English fields and years,
 * max lengths, and trims values. Optional hi/gu keys are trimmed and length-checked if present.
 */
export function validateAndSanitizeAboutPayload(
  body: Record<string, unknown>,
): Record<string, string> {
  const str = stringifyBody(body);
  if (!payloadTouchesAboutSection(str)) {
    return str;
  }

  for (const k of REQUIRED_ABOUT_KEYS) {
    if (!(k in str)) {
      throw new BadRequestException(`Missing required About field: ${k}`);
    }
  }

  const out: Record<string, string> = { ...str };

  const aboutYears = (out.about_years ?? '').trim();
  if (!aboutYears) {
    throw new BadRequestException('Years value is required');
  }
  if (aboutYears.length > ABOUT_MAX.years) {
    throw new BadRequestException(`Years value must not exceed ${ABOUT_MAX.years} characters`);
  }
  out.about_years = aboutYears;

  for (const key of [
    'about_en_title',
    'about_en_para1',
    'about_en_para2',
    'about_en_years_label',
  ] as const) {
    const v = (out[key] ?? '').trim();
    if (!v) {
      throw new BadRequestException(`${EN_LABELS[key] ?? key} is required`);
    }
    const field = key.replace('about_en_', '') as 'title' | 'para1' | 'para2' | 'years_label';
    const max = ABOUT_MAX[field];
    if (v.length > max) {
      throw new BadRequestException(
        `${EN_LABELS[key] ?? key} must not exceed ${max} characters`,
      );
    }
    out[key] = v;
  }

  for (const lang of ['hi', 'gu'] as const) {
    for (const field of TEXT_FIELDS) {
      const key = `about_${lang}_${field}`;
      if (!(key in out)) continue;
      const v = (out[key] ?? '').trim();
      const max = ABOUT_MAX[field];
      if (v.length > max) {
        throw new BadRequestException(
          `${lang.toUpperCase()} ${field}: must not exceed ${max} characters`,
        );
      }
      out[key] = v;
    }
  }

  return out;
}
