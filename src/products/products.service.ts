import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Subcategory } from '../entities/subcategory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Subcategory) private readonly subcategoryRepo: Repository<Subcategory>,
  ) {}

  async findAll(lang = 'en', category?: string, subcategory?: string) {
    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt', 'pt.lang = :lang', { lang })
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('c.translations', 'ct', 'ct.lang = :lang', { lang })
      .leftJoinAndSelect('p.subcategory', 's')
      .leftJoinAndSelect('s.translations', 'st', 'st.lang = :lang', { lang })
      .where('p.isActive = true')
      .orderBy('p.sortOrder', 'ASC');

    if (category) qb.andWhere('c.slug = :category', { category });
    if (subcategory) qb.andWhere('s.slug = :subcategory', { subcategory });

    const products = await qb.getMany();
    return products.map((p) => this.format(p, lang));
  }

  async findFeatured(lang = 'en') {
    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt', 'pt.lang = :lang', { lang })
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('c.translations', 'ct', 'ct.lang = :lang', { lang })
      .leftJoinAndSelect('p.subcategory', 's')
      .where('p.isActive = true')
      .andWhere('p.isFeatured = true')
      .orderBy('p.sortOrder', 'ASC');
    const products = await qb.getMany();
    return products.map((p) => this.format(p, lang));
  }

  async toggleFeatured(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    product.isFeatured = !product.isFeatured;
    await this.productRepo.save(product);
    return { id: product.id, isFeatured: product.isFeatured };
  }

  async findBySlug(slug: string, lang = 'en') {
    const p = await this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('c.translations', 'ct')
      .leftJoinAndSelect('p.subcategory', 's')
      .leftJoinAndSelect('s.translations', 'st')
      .where('p.slug = :slug', { slug })
      .andWhere('p.isActive = true')
      .getOne();

    if (!p) throw new NotFoundException('Product not found');
    return this.formatAll(p);
  }

  async findAllAdmin() {
    return this.productRepo.find({
      relations: ['translations', 'category', 'subcategory'],
      order: { sortOrder: 'ASC' },
    });
  }

  async create(data: Partial<Product> & { categoryId?: number; subcategoryId?: number }) {
    const { categoryId, subcategoryId, ...rest } = data;
    const product = this.productRepo.create(rest);
    if (categoryId) product.category = { id: categoryId } as Category;
    if (subcategoryId) product.subcategory = { id: subcategoryId } as Subcategory;
    return this.productRepo.save(product);
  }

  async update(id: number, data: Partial<Product> & { categoryId?: number; subcategoryId?: number }) {
    const { categoryId, subcategoryId, ...rest } = data;
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, rest);
    if (categoryId !== undefined) product.category = { id: categoryId } as Category;
    if (subcategoryId !== undefined) product.subcategory = { id: subcategoryId } as Subcategory;
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    await this.productRepo.delete(id);
  }

  async getCategories(lang = 'en') {
    const cats = await this.categoryRepo.find({
      relations: ['translations', 'subcategories', 'subcategories.translations'],
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.translations.find((t) => t.lang === lang)?.name ?? c.slug,
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.translations.find((t) => t.lang === lang)?.name ?? s.slug,
      })),
    }));
  }

  private format(p: Product, lang: string) {
    const t = p.translations?.find((tr) => tr.lang === lang);
    return {
      id: p.id,
      slug: p.slug,
      imagePath: p.imagePath,
      sortOrder: p.sortOrder,
      isFeatured: p.isFeatured,
      category: p.category ? {
        id: p.category.id,
        slug: p.category.slug,
        name: p.category.translations?.find((t) => t.lang === lang)?.name ?? p.category.slug,
      } : null,
      subcategory: p.subcategory ? { id: p.subcategory.id, slug: p.subcategory.slug } : null,
      name: t?.name ?? p.slug,
      description: t?.description ?? '',
      detailIntro: t?.detailIntro ?? '',
    };
  }

  private formatAll(p: Product) {
    const translations: Record<string, any> = {};
    for (const t of p.translations ?? []) {
      translations[t.lang] = { name: t.name, description: t.description, detailIntro: t.detailIntro };
    }
    return {
      id: p.id,
      slug: p.slug,
      imagePath: p.imagePath,
      sortOrder: p.sortOrder,
      category: p.category ? { id: p.category.id, slug: p.category.slug } : null,
      subcategory: p.subcategory ? { id: p.subcategory.id, slug: p.subcategory.slug } : null,
      translations,
    };
  }
}
