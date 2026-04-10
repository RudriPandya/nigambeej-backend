import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from '../entities/hero-slide.entity';
import { HeroSlideTranslation } from '../entities/hero-slide-translation.entity';

const LANGS = ['en', 'hi', 'gu'] as const;

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
    });
    return slides.map((s) => this.format(s, lang));
  }

  findAllAdmin() {
    return this.repo.find({ relations: ['translations'], order: { sortOrder: 'ASC' } });
  }

  async create(data: any) {
    const slide = this.repo.create({
      imagePath: data.imagePath ?? null,
      sortOrder: data.sortOrder ? +data.sortOrder : 0,
    });
    const saved = await this.repo.save(slide);
    const translations = this.parseTranslations(data.translations);
    if (translations) await this.saveTranslations(saved, translations);
    return this.repo.findOne({ where: { id: saved.id }, relations: ['translations'] });
  }

  async update(id: number, data: any) {
    const slide = await this.repo.findOne({ where: { id }, relations: ['translations'] });
    if (!slide) throw new NotFoundException();

    if (data.imagePath) slide.imagePath = data.imagePath;
    if (data.sortOrder !== undefined) slide.sortOrder = +data.sortOrder;
    await this.repo.save(slide);

    const translations = this.parseTranslations(data.translations);
    if (translations) await this.saveTranslations(slide, translations);
    return this.repo.findOne({ where: { id }, relations: ['translations'] });
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
      imagePath: s.imagePath,
      sortOrder: s.sortOrder,
      title: t?.title ?? '',
      subtitle: t?.subtitle ?? '',
      ctaLabel: t?.ctaLabel ?? '',
      ctaUrl: t?.ctaUrl ?? '',
    };
  }
}
