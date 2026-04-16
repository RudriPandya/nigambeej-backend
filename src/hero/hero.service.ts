import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from '../entities/hero-slide.entity';
import { HeroSlideTranslation } from '../entities/hero-slide-translation.entity';

const LANGS = ['en', 'hi', 'gu'] as const;

const EN_REQUIRED_FIELDS = ['title', 'subtitle', 'ctaLabel', 'ctaUrl'] as const;

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(HeroSlide) private readonly repo: Repository<HeroSlide>,
    @InjectRepository(HeroSlideTranslation) private readonly transRepo: Repository<HeroSlideTranslation>,
  ) {}

  async findAll(lang = 'en') {
    const slides = await this.repo.find({
      where: { isActive: true },
      relations: ['translations'],
      order: { sortOrder: 'ASC' },
      select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName', 'sortOrder', 'isActive'],
    });
    return slides.map((s) => this.format(s, lang));
  }

  findAllAdmin() {
    return this.repo.find({ relations: ['translations'], order: { sortOrder: 'ASC' }, select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName', 'sortOrder', 'isActive'] }).then(slides =>
      slides.map(s => this.formatAdmin(s))
    );
  }
  findOne(id: number) {
    return this.repo.findOne({ where: { id, isActive: true } });
  }

  findOneWithImage(id: number) {
    return this.repo.findOne({ where: { id, isActive: true }, select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName', 'sortOrder', 'isActive'] });
  }
  async create(data: any) {
    const sortOrder =
      data.sortOrder !== undefined && data.sortOrder !== '' ? +data.sortOrder : 0;
    await this.assertUniqueSortOrder(sortOrder);

    const translations = this.parseTranslations(data.translations);
    if (!translations) {
      throw new BadRequestException('Translations JSON is required');
    }
    this.validateEnglishTranslations(translations);

    const slide = this.repo.create({
      imageData: data.imageData ?? null,
      imageMimetype: data.imageMimetype ?? null,
      imageOriginalName: data.imageOriginalName ?? null,
      sortOrder,
    });
    const saved = await this.repo.save(slide);
    await this.saveTranslations(saved, translations);
    return this.repo.findOne({ where: { id: saved.id }, relations: ['translations'], select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName', 'sortOrder', 'isActive'] });
  }

  async update(id: number, data: any) {
    const slide = await this.repo.findOne({ where: { id }, relations: ['translations'] });
    if (!slide) throw new NotFoundException();

    if (data.sortOrder !== undefined && data.sortOrder !== '') {
      const nextOrder = +data.sortOrder;
      await this.assertUniqueSortOrder(nextOrder, id);
      slide.sortOrder = nextOrder;
    }
    if (data.imageData !== undefined) slide.imageData = data.imageData;
    if (data.imageMimetype !== undefined) slide.imageMimetype = data.imageMimetype;
    if (data.imageOriginalName !== undefined) slide.imageOriginalName = data.imageOriginalName;
    await this.repo.save(slide);

    const rawTrans = data.translations;
    if (rawTrans !== undefined && rawTrans !== null && String(rawTrans).trim() !== '') {
      const translations = this.parseTranslations(rawTrans);
      if (!translations) {
        throw new BadRequestException('Invalid translations JSON');
      }
      this.validateEnglishTranslations(translations);
      await this.saveTranslations(slide, translations);
    }
    return this.repo.findOne({ where: { id }, relations: ['translations'], select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName', 'sortOrder', 'isActive'] });
  }

  private async assertUniqueSortOrder(sortOrder: number, excludeId?: number): Promise<void> {
    const existing = await this.repo.findOne({ where: { sortOrder } });
    if (existing && (excludeId === undefined || existing.id !== excludeId)) {
      throw new BadRequestException('Sort order is already used by another slide');
    }
  }

  private validateEnglishTranslations(translations: Record<string, any>): void {
    const en = translations?.en;
    if (!en || typeof en !== 'object') {
      throw new BadRequestException('English (en) translations are required');
    }
    const labels: Record<(typeof EN_REQUIRED_FIELDS)[number], string> = {
      title: 'title',
      subtitle: 'subtitle',
      ctaLabel: 'button label',
      ctaUrl: 'button URL',
    };
    for (const field of EN_REQUIRED_FIELDS) {
      const v = en[field];
      if (typeof v !== 'string' || !v.trim()) {
        throw new BadRequestException(`English ${labels[field]} is required`);
      }
    }
  }

  private parseTranslations(raw: any): Record<string, any> | null {
    if (!raw) return null;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return null; }
    }
    if (typeof raw === 'object') return raw;
    return null;
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  private async saveTranslations(slide: HeroSlide, translations: Record<string, any>) {
    if (!translations || typeof translations !== 'object') return;
    for (const lang of LANGS) {
      const t = translations[lang];
      if (!t) continue;
      let row = await this.transRepo.findOne({ where: { slide: { id: slide.id }, lang } });
      if (!row) {
        row = this.transRepo.create({ slide, lang });
      }
      row.title = t.title ?? '';
      row.subtitle = t.subtitle ?? '';
      row.ctaLabel = t.ctaLabel ?? '';
      row.ctaUrl = t.ctaUrl ?? '';
      await this.transRepo.save(row);
    }
  }

  private format(s: HeroSlide, lang: string) {
    const t = s.translations?.find((tr) => tr.lang === lang);
    return {
      id: s.id,
      imageUrl: s.imageData ? `/api/hero/${s.id}/image` : null,
      sortOrder: s.sortOrder,
      title: t?.title ?? '',
      subtitle: t?.subtitle ?? '',
      ctaLabel: t?.ctaLabel ?? '',
      ctaUrl: t?.ctaUrl ?? '',
    };
  }

  private formatAdmin(s: HeroSlide) {
    const t = s.translations?.find((tr) => tr.lang === 'en');
    return {
      id: s.id,
      imageUrl: s.imageData ? `/api/hero/${s.id}/image` : null,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
      translations: s.translations,
      title: t?.title ?? '',
      subtitle: t?.subtitle ?? '',
      ctaLabel: t?.ctaLabel ?? '',
      ctaUrl: t?.ctaUrl ?? '',
    };
  }
}
