import { BadRequestException } from '@nestjs/common';

export const INFO_MAX = {
  title: 400,
  desc: 12000,
  btn_url: 500,
  practices_slugs: 8000,
} as const;

const REQUIRED_INFO_KEYS = [
  'info_btn_url',
  'info_en_title',
  'info_en_desc',
  'info_practices_slugs',
] as const;

export function payloadTouchesInformationSection(body: object): boolean {
  if (!body || typeof body !== 'object') return false;
  return Object.keys(body).some(
    (k) => k.startsWith('info_') && k !== 'info_card_image',
  );
}

/** Relative path or http(s) URL, no whitespace */
function assertValidButtonUrl(raw: string): void {
  const u = raw.trim();
  if (!u) {
    throw new BadRequestException('Button link URL is required');
  }
  if (u.length > INFO_MAX.btn_url) {
    throw new BadRequestException(`Button URL must not exceed ${INFO_MAX.btn_url} characters`);
  }
  if (/\s/.test(u)) {
    throw new BadRequestException('Button URL must not contain spaces');
  }
  const ok =
    u.startsWith('/') ||
    /^https?:\/\//i.test(u);
  if (!ok) {
    throw new BadRequestException('Button URL must start with / or http:// or https://');
  }
}

/**
 * When the batch includes any Information page key, validates required English fields,
 * button URL, practices slugs length, and optional hi/gu max lengths.
 */
export function validateAndSanitizeInfoPayload(
  body: Record<string, string>,
): Record<string, string> {
  if (!payloadTouchesInformationSection(body)) {
    return { ...body };
  }

  for (const k of REQUIRED_INFO_KEYS) {
    if (!(k in body)) {
      throw new BadRequestException(`Missing required Information field: ${k}`);
    }
  }

  const out: Record<string, string> = { ...body };

  assertValidButtonUrl(out.info_btn_url ?? '');
  out.info_btn_url = (out.info_btn_url ?? '').trim();

  const slugs = (out.info_practices_slugs ?? '').trim();
  if (slugs.length > INFO_MAX.practices_slugs) {
    throw new BadRequestException(
      `Product slugs list must not exceed ${INFO_MAX.practices_slugs} characters`,
    );
  }
  out.info_practices_slugs = slugs;

  const enTitle = (out.info_en_title ?? '').trim();
  if (!enTitle) {
    throw new BadRequestException('English title is required');
  }
  if (enTitle.length > INFO_MAX.title) {
    throw new BadRequestException(`English title must not exceed ${INFO_MAX.title} characters`);
  }
  out.info_en_title = enTitle;

  const enDesc = (out.info_en_desc ?? '').trim();
  if (!enDesc) {
    throw new BadRequestException('English description is required');
  }
  if (enDesc.length > INFO_MAX.desc) {
    throw new BadRequestException(`English description must not exceed ${INFO_MAX.desc} characters`);
  }
  out.info_en_desc = enDesc;

  for (const lang of ['hi', 'gu'] as const) {
    for (const field of ['title', 'desc'] as const) {
      const key = `info_${lang}_${field}`;
      if (!(key in out)) continue;
      const v = (out[key] ?? '').trim();
      const max = field === 'title' ? INFO_MAX.title : INFO_MAX.desc;
      if (v.length > max) {
        throw new BadRequestException(
          `${lang.toUpperCase()} ${field === 'title' ? 'title' : 'description'} must not exceed ${max} characters`,
        );
      }
      out[key] = v;
    }
  }

  return out;
}
