import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { BlogPostTranslation } from '../entities/blog-post-translation.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost) private readonly repo: Repository<BlogPost>,
    @InjectRepository(BlogPostTranslation) private readonly translationRepo: Repository<BlogPostTranslation>,
  ) {}

  private parseTranslations(raw: any): Record<string, any> | null {
    if (!raw) return null;
    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
    if (typeof raw === 'object') return raw;
    return null;
  }

  private async saveTranslations(post: BlogPost, translations: Record<string, any>) {
    for (const lang of Object.keys(translations)) {
      const t = translations[lang];
      if (!t?.title) continue;
      const existing = await this.translationRepo.findOne({ where: { post: { id: post.id }, lang } });
      if (existing) {
        existing.title   = t.title   ?? existing.title;
        existing.excerpt = t.excerpt ?? existing.excerpt;
        existing.content = t.content ?? existing.content;
        await this.translationRepo.save(existing);
      } else {
        await this.translationRepo.save(
          this.translationRepo.create({ post, lang, title: t.title, excerpt: t.excerpt ?? '', content: t.content ?? '' }),
        );
      }
    }
  }

  async findAll(lang = 'en', page = 1, limit = 9) {
    const [posts, total] = await this.repo.createQueryBuilder('p')
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

  async findAllAdmin() {
    return this.repo.find({ relations: ['translations'], order: { createdAt: 'DESC' } });
  }

  async findOneAdmin(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['translations'] });
  }

  async create(data: any) {
    const translations = this.parseTranslations(data.translations);
    const post = this.repo.create({
      slug:        data.slug,
      coverImage:  data.coverImage ?? null,
      isPublished: data.isPublished === 'true' || data.isPublished === true,
    }) as BlogPost;
    if (post.isPublished) post.publishedAt = new Date();
    await this.repo.save(post);
    if (translations) await this.saveTranslations(post, translations);
    return this.repo.findOne({ where: { id: post.id }, relations: ['translations'] });
  }

  async update(id: number, data: any) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const translations = this.parseTranslations(data.translations);
    if (data.slug)       post.slug        = data.slug;
    if (data.coverImage) post.coverImage  = data.coverImage;
    post.isPublished = data.isPublished === 'true' || data.isPublished === true;
    if (post.isPublished && !post.publishedAt) post.publishedAt = new Date();
    await this.repo.save(post);
    if (translations) await this.saveTranslations(post, translations);
    return this.repo.findOne({ where: { id: post.id }, relations: ['translations'] });
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  private format(p: BlogPost, lang: string) {
    const t = p.translations?.find((tr) => tr.lang === lang);
    return {
      id:          p.id,
      slug:        p.slug,
      coverImage:  p.coverImage,
      isPublished: p.isPublished,
      publishedAt: p.publishedAt,
      title:       t?.title   ?? '',
      excerpt:     t?.excerpt ?? '',
      content:     t?.content ?? '',
    };
  }
}
