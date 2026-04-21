import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { BlogPostTranslation } from '../entities/blog-post-translation.entity';

const LANGS = ['en', 'hi', 'gu'] as const;

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost) private readonly repo: Repository<BlogPost>,
    @InjectRepository(BlogPostTranslation) private readonly translationRepo: Repository<BlogPostTranslation>,
  ) {}

  private parseTranslations(raw: unknown): Record<string, Record<string, string>> | null {
    if (!raw) return null;
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw) as Record<string, Record<string, string>>;
        return typeof p === 'object' && p !== null ? p : null;
      } catch {
        return null;
      }
    }
    if (typeof raw === 'object') return raw as Record<string, Record<string, string>>;
    return null;
  }

  private validateEnglishBlock(translations: Record<string, Record<string, string>>): void {
    const en = translations.en;
    if (!en) {
      throw new BadRequestException('English translation is required');
    }
    const title = (en.title ?? '').trim();
    const excerpt = (en.excerpt ?? '').trim();
    const content = (en.content ?? '').trim();
    if (!title) throw new BadRequestException('English title is required');
    if (!excerpt) throw new BadRequestException('English excerpt is required');
    if (!content) throw new BadRequestException('English content is required');
  }

  private async assertSlugUnique(slug: string, excludeId?: number): Promise<void> {
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing && (excludeId === undefined || existing.id !== excludeId)) {
      throw new BadRequestException('Slug is already in use');
    }
  }

  private async saveTranslations(post: BlogPost, translations: Record<string, Record<string, string>>) {
    for (const lang of Object.keys(translations)) {
      const t = translations[lang];
      if (!t?.title?.trim()) continue;
      const existing = await this.translationRepo.findOne({ where: { post: { id: post.id }, lang } });
      if (existing) {
        existing.title = t.title ?? existing.title;
        existing.excerpt = t.excerpt ?? existing.excerpt;
        existing.content = t.content ?? existing.content;
        await this.translationRepo.save(existing);
      } else {
        await this.translationRepo.save(
          this.translationRepo.create({
            post,
            lang,
            title: t.title,
            excerpt: t.excerpt ?? '',
            content: t.content ?? '',
          }),
        );
      }
    }
  }

  async findAll(lang = 'en', page = 1, limit = 9) {
    const [posts, total] = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt', 'pt.lang = :lang', { lang })
      .where('p.isPublished = true')
      .orderBy('p.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: posts.map((p) => this.format(p, lang)), total, page, limit };
  }

  async findBySlug(slug: string, lang = 'en') {
    const p = await this.repo.findOne({ where: { slug, isPublished: true }, relations: ['translations'] });
    if (!p) throw new NotFoundException('Blog post not found');
    return this.format(p, lang);
  }

  async findAllAdmin(page = 1, limit = 10) {
    const take = Math.min(1000, Math.max(1, limit));
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * take;

    const total = await this.repo.count();

    const idSlice = await this.repo.find({
      select: { id: true },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    const ids = idSlice.map((p) => p.id);

    let data: BlogPost[] = [];
    if (ids.length > 0) {
      const rows = await this.repo.find({
        where: { id: In(ids) },
        relations: ['translations'],
      });
      const orderMap = new Map(ids.map((id, i) => [id, i]));
      rows.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      data = rows;
    }

    return {
      data: data.map((p) => ({ ...p, coverImageUrl: `/api/blog/${p.id}/image` })),
      total,
      page: safePage,
      limit: take,
    };
  }

  async findOneAdmin(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['translations'] });
  }

  async findOneAdminWithImage(id: number) {
    return this.repo.findOne({ where: { id }, select: ['id', 'slug', 'coverImageData', 'coverImageMimetype', 'coverImageOriginalName', 'isPublished', 'publishedAt', 'createdAt', 'updatedAt'] });
  }

  async create(data: Record<string, unknown>) {
    const slug = String(data.slug ?? '').trim();
    if (!slug) throw new BadRequestException('Slug is required');

    const translations = this.parseTranslations(data.translations);
    if (!translations) throw new BadRequestException('Translations are required');
    this.validateEnglishBlock(translations);

    const coverImageData = data.coverImageData as Buffer | undefined;
    const coverImageMimetype = data.coverImageMimetype as string | undefined;
    const coverImageOriginalName = data.coverImageOriginalName as string | undefined;
    if (!coverImageData || !coverImageMimetype || !coverImageOriginalName) {
      throw new BadRequestException('Cover image is required');
    }

    await this.assertSlugUnique(slug);

    const published =
      data.isPublished === 'true' ||
      data.isPublished === true ||
      data.published === 'true' ||
      data.published === true;

    const post = this.repo.create({
      slug,
      coverImageData,
      coverImageMimetype,
      coverImageOriginalName,
      isPublished: !!published,
    }) as BlogPost;
    if (post.isPublished) post.publishedAt = new Date();
    await this.repo.save(post);
    await this.saveTranslations(post, translations);
    return this.repo.findOne({ where: { id: post.id }, relations: ['translations'] });
  }

  async update(id: number, data: Record<string, unknown>) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const translations = this.parseTranslations(data.translations);
    if (translations) {
      this.validateEnglishBlock(translations);
    } else {
      throw new BadRequestException('Translations are required');
    }

    if (data.slug !== undefined) {
      const slug = String(data.slug).trim();
      if (!slug) throw new BadRequestException('Slug cannot be empty');
      await this.assertSlugUnique(slug, id);
      post.slug = slug;
    }

    const incomingCoverData = data.coverImageData as Buffer | undefined;
    const incomingCoverMimetype = data.coverImageMimetype as string | undefined;
    const incomingCoverOriginalName = data.coverImageOriginalName as string | undefined;
    if (incomingCoverData !== undefined && incomingCoverMimetype !== undefined && incomingCoverOriginalName !== undefined) {
      post.coverImageData = incomingCoverData;
      post.coverImageMimetype = incomingCoverMimetype;
      post.coverImageOriginalName = incomingCoverOriginalName;
    }

    if (!post.coverImageMimetype || !post.coverImageOriginalName) {
      throw new BadRequestException('Cover image is required');
    }

    const published =
      data.isPublished !== undefined || data.published !== undefined
        ? data.isPublished === 'true' ||
          data.isPublished === true ||
          data.published === 'true' ||
          data.published === true
        : post.isPublished;
    post.isPublished = !!published;
    if (post.isPublished && !post.publishedAt) post.publishedAt = new Date();

    await this.repo.save(post);
    await this.saveTranslations(post, translations);
    return this.repo.findOne({ where: { id: post.id }, relations: ['translations'] });
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  private format(p: BlogPost, lang: string) {
    const t = p.translations?.find((tr) => tr.lang === lang);
    return {
      id: p.id,
      slug: p.slug,
      coverImageUrl: p.coverImageMimetype ? `/api/blog/${p.id}/image` : null,
      isPublished: p.isPublished,
      publishedAt: p.publishedAt,
      title: t?.title ?? '',
      excerpt: t?.excerpt ?? '',
      content: t?.content ?? '',
    };
  }
}
