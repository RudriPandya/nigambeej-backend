import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVideo } from '../entities/product-video.entity';
import { ProductVideoTranslation } from '../entities/product-video-translation.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(ProductVideo) private readonly repo: Repository<ProductVideo>,
    @InjectRepository(ProductVideoTranslation) private readonly translationRepo: Repository<ProductVideoTranslation>,
  ) {}

  private parseTranslations(raw: any): Record<string, any> | null {
    if (!raw) return null;
    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
    if (typeof raw === 'object') return raw;
    return null;
  }

  private async saveTranslations(video: ProductVideo, translations: Record<string, any>) {
    for (const lang of Object.keys(translations)) {
      const t = translations[lang];
      if (!t?.title) continue;
      const existing = await this.translationRepo.findOne({ where: { video: { id: video.id }, lang } });
      if (existing) {
        existing.title = t.title;
        await this.translationRepo.save(existing);
      } else {
        await this.translationRepo.save(
          this.translationRepo.create({ video, lang, title: t.title }),
        );
      }
    }
  }

  async findAll(lang = 'en') {
    const videos = await this.repo.find({
      where: { isActive: true },
      relations: ['translations', 'product'],
      order: { sortOrder: 'ASC' },
    });
    return videos.map((v) => {
      const t = v.translations?.find((tr) => tr.lang === lang);
      return {
        id: v.id,
        videoId: v.videoId,
        sortOrder: v.sortOrder,
        productId: v.product?.id ?? null,
        title: t?.title ?? '',
      };
    });
  }

  findAllAdmin() {
    return this.repo.find({ relations: ['translations', 'product'], order: { sortOrder: 'ASC' } });
  }

  async create(data: any) {
    const translations = this.parseTranslations(data.translations);
    const video = this.repo.create({
      videoId: data.videoId,
      sortOrder: +data.sortOrder || 0,
      isActive: true,
    });
    await this.repo.save(video);
    if (translations) await this.saveTranslations(video, translations);
    return this.repo.findOne({ where: { id: video.id }, relations: ['translations'] });
  }

  async update(id: number, data: any) {
    const video = await this.repo.findOne({ where: { id } });
    if (!video) throw new NotFoundException();
    const translations = this.parseTranslations(data.translations);
    if (data.videoId !== undefined) video.videoId = data.videoId;
    if (data.sortOrder !== undefined) video.sortOrder = +data.sortOrder || 0;
    await this.repo.save(video);
    if (translations) await this.saveTranslations(video, translations);
    return this.repo.findOne({ where: { id: video.id }, relations: ['translations'] });
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
