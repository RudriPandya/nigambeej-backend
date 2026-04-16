import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductTranslation } from '../entities/product-translation.entity';
import { Category } from '../entities/category.entity';
import { Subcategory } from '../entities/subcategory.entity';

const LANGS = ['en', 'hi', 'gu'] as const;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductTranslation) private readonly transRepo: Repository<ProductTranslation>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Subcategory) private readonly subcategoryRepo: Repository<Subcategory>,
  ) {}

  private async assertSlugUnique(slug: string, excludeId?: number): Promise<void> {
    const existing = await this.productRepo.findOne({ where: { slug } });
    if (existing && (excludeId === undefined || existing.id !== excludeId)) {
      throw new BadRequestException('Slug is already in use');
    }
  }

  private async assertUniqueSortOrder(sortOrder: number, excludeId?: number): Promise<void> {
    const existing = await this.productRepo.findOne({ where: { sortOrder } });
    if (existing && (excludeId === undefined || existing.id !== excludeId)) {
      throw new BadRequestException('Sort order is already used by another product');
    }
  }

  private async assertUniqueEnglishName(name: string, excludeProductId?: number): Promise<void> {
    const normalized = name.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('English product name is required');
    }
    const qb = this.productRepo
      .createQueryBuilder('p')
      .innerJoin('p.translations', 't')
      .where('t.lang = :lang', { lang: 'en' })
      .andWhere('LOWER(TRIM(t.name)) = :name', { name: normalized });
    if (excludeProductId !== undefined) {
      qb.andWhere('p.id != :id', { id: excludeProductId });
    }
    const dup = await qb.getOne();
    if (dup) {
      throw new BadRequestException('A product with this English name already exists');
    }
  }

  private parseTranslationsNested(
    data: Record<string, unknown>,
  ): Record<string, { name?: string; description?: string }> | null {
    const t = data.translations;
    if (t === undefined || t === null) return null;
    if (typeof t === 'string') {
      try {
        const p = JSON.parse(t) as Record<string, { name?: string; description?: string }>;
        return typeof p === 'object' && p !== null ? p : null;
      } catch {
        return null;
      }
    }
    if (typeof t === 'object') return t as Record<string, { name?: string; description?: string }>;
    return null;
  }

  private parseCategoryIds(data: Record<string, unknown>): {
    categoryId?: number;
    subcategoryId?: number;
  } {
    const rawCat = data.categoryId;
    const rawSub = data.subcategoryId;
    const categoryId =
      rawCat !== undefined && rawCat !== '' && rawCat !== null ? Number(rawCat) : undefined;
    const subcategoryId =
      rawSub !== undefined && rawSub !== '' && rawSub !== null ? Number(rawSub) : undefined;
    return {
      categoryId: categoryId !== undefined && !Number.isNaN(categoryId) ? categoryId : undefined,
      subcategoryId: subcategoryId !== undefined && !Number.isNaN(subcategoryId) ? subcategoryId : undefined,
    };
  }

  private async assertSubcategoryBelongsToCategory(categoryId: number, subcategoryId: number): Promise<void> {
    const sub = await this.subcategoryRepo.findOne({
      where: { id: subcategoryId, category: { id: categoryId } },
    });
    if (!sub) {
      throw new BadRequestException('Subcategory does not belong to the selected category');
    }
  }

  private async saveProductTranslations(
    product: Product,
    translations: Record<string, { name?: string; description?: string }>,
  ): Promise<void> {
    for (const lang of LANGS) {
      const row = translations[lang];
      if (!row) continue;
      const name = (row.name ?? '').trim();
      const description = (row.description ?? '').trim();
      if (lang !== 'en' && !name) continue;
      if (lang === 'en' && !name) {
        throw new BadRequestException('English product name is required');
      }
      let existing = await this.transRepo.findOne({
        where: { product: { id: product.id }, lang },
      });
      if (!existing) {
        existing = this.transRepo.create({ product, lang, name: '', description: null });
      }
      existing.name = name;
      existing.description = description || null;
      await this.transRepo.save(existing);
    }
  }

  async findOne(id: number) {
    return this.productRepo.findOne({ where: { id, isActive: true } });
  }

  async findOneWithImage(id: number) {
    return this.productRepo.findOne({ where: { id, isActive: true }, select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName', 'slug', 'sortOrder', 'isActive'] });
  }

  async findAll(lang = 'en', category?: string, subcategory?: string, page?: number, limit?: number) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt', 'pt.lang = :lang', { lang })
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('c.translations', 'ct', 'ct.lang = :lang', { lang })
      .leftJoinAndSelect('p.subcategory', 's')
      .leftJoinAndSelect('s.translations', 'st', 'st.lang = :lang', { lang })
      .where('p.isActive = true')
      .orderBy('p.sortOrder', 'DESC')
      .addOrderBy('p.id', 'DESC');

    if (category) qb.andWhere('c.slug = :category', { category });
    if (subcategory) qb.andWhere('s.slug = :subcategory', { subcategory });

    if (page !== undefined) {
      const take = limit ?? 24;
      const skip = (page - 1) * take;
      qb.skip(skip).take(take);
      const [rows, total] = await qb.getManyAndCount();
      return {
        data: rows.map((p) => this.format(p, lang)),
        total,
        page,
        limit: take,
      };
    }

    const products = await qb.getMany();
    return products.map((p) => this.format(p, lang));
  }

  async findFeatured(lang = 'en') {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt', 'pt.lang = :lang', { lang })
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('c.translations', 'ct', 'ct.lang = :lang', { lang })
      .leftJoinAndSelect('p.subcategory', 's')
      .where('p.isActive = true')
      .andWhere('p.isFeatured = true')
      .orderBy('p.sortOrder', 'DESC')
      .addOrderBy('p.id', 'DESC');
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
    const p = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 'pt')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('c.translations', 'ct')
      .leftJoinAndSelect('p.subcategory', 's')
      .leftJoinAndSelect('s.translations', 'st')
      .where('p.slug = :slug', { slug })
      .andWhere('p.isActive = true')
      .getOne();

    if (!p) throw new NotFoundException('Product not found');
    // Use `format` (not `formatAll`) so the JSON matches list/featured items: top-level `name`,
    // `description`, and `detailIntro` for the requested `lang`. The detail page expects this shape.
    return this.format(p, lang);
  }

  /**
   * Paginated admin list (default 10 per page). Uses ID-slice first to avoid inflated counts from translation joins.
   */
  async findAllAdmin(page = 1, limit = 10) {
    const take = Math.min(1000, Math.max(1, limit));
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * take;

    const total = await this.productRepo.count();

    const idSlice = await this.productRepo.find({
      order: { sortOrder: 'DESC', id: 'DESC' },
      skip,
      take,
      select: { id: true },
    });
    const ids = idSlice.map((p) => p.id);

    let data: Product[] = [];
    if (ids.length > 0) {
      const rows = await this.productRepo.find({
        where: { id: In(ids) },
        relations: ['translations', 'category', 'subcategory'],
      });
      const orderMap = new Map(ids.map((id, i) => [id, i]));
      rows.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      data = rows;
    }

    const maxSortRaw = await this.productRepo
      .createQueryBuilder('p')
      .select('MAX(p.sortOrder)', 'm')
      .getRawOne();
    const maxSort = maxSortRaw?.m != null ? Number(maxSortRaw.m) : -1;

    return {
      data: data.map((p) => ({ ...p, imageUrl: `/api/products/${p.id}/image` })),
      total,
      page: safePage,
      limit: take,
      nextSortOrder: maxSort + 1,
    };
  }

  async create(data: Record<string, unknown>) {
    const slug = String(data.slug ?? '').trim();
    if (!slug) throw new BadRequestException('Slug is required');

    const sortOrder =
      data.sortOrder !== undefined && data.sortOrder !== '' ? Number(data.sortOrder) : 0;
    if (Number.isNaN(sortOrder) || sortOrder < 0) {
      throw new BadRequestException('Sort order must be a number ≥ 0');
    }

    await this.assertSlugUnique(slug);
    await this.assertUniqueSortOrder(sortOrder);

    const translationsPayload = this.parseTranslationsNested(data);
    if (!translationsPayload) {
      throw new BadRequestException('Translations are required');
    }
    const enName = translationsPayload.en?.name !== undefined ? String(translationsPayload.en.name).trim() : '';
    if (!enName) throw new BadRequestException('English product name is required');
    const enDesc = translationsPayload.en?.description !== undefined ? String(translationsPayload.en.description).trim() : '';
    if (!enDesc) throw new BadRequestException('English description is required');
    await this.assertUniqueEnglishName(enName);

    const { categoryId, subcategoryId } = this.parseCategoryIds(data);
    if (categoryId === undefined || subcategoryId === undefined) {
      throw new BadRequestException('Category and subcategory are required');
    }
    await this.assertSubcategoryBelongsToCategory(categoryId, subcategoryId);

    const imageData = data.imageData as Buffer | undefined;
    const imageMimetype = data.imageMimetype as string | undefined;
    const imageOriginalName = data.imageOriginalName as string | undefined;
    if (!imageData || !imageMimetype || !imageOriginalName) {
      throw new BadRequestException('Product image is required');
    }

    const product = this.productRepo.create({
      slug,
      sortOrder,
      imageData,
      imageMimetype,
      imageOriginalName,
      isActive: true,
      isFeatured: data.isFeatured === true || data.isFeatured === 'true',
    });
    product.category = { id: categoryId } as Category;
    product.subcategory = { id: subcategoryId } as Subcategory;

    const saved = await this.productRepo.save(product);
    await this.saveProductTranslations(saved, translationsPayload);

    return this.productRepo.findOne({
      where: { id: saved.id },
      relations: ['translations', 'category', 'subcategory'],
    });
  }

  async update(id: number, data: Record<string, unknown>) {
    // Do not load `translations` here: Product has cascade on translations, and saving the parent
    // with loaded children can trigger duplicate/conflicting writes or FK issues with multipart updates.
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (data.slug !== undefined) {
      const slug = String(data.slug).trim();
      if (!slug) throw new BadRequestException('Slug cannot be empty');
      await this.assertSlugUnique(slug, id);
      product.slug = slug;
    }

    if (data.sortOrder !== undefined && data.sortOrder !== '') {
      const nextOrder = Number(data.sortOrder);
      if (Number.isNaN(nextOrder) || nextOrder < 0) {
        throw new BadRequestException('Sort order must be a number ≥ 0');
      }
      await this.assertUniqueSortOrder(nextOrder, id);
      product.sortOrder = nextOrder;
    }

    const incomingImageData = data.imageData as Buffer | undefined;
    const incomingImageMimetype = data.imageMimetype as string | undefined;
    const incomingImageOriginalName = data.imageOriginalName as string | undefined;
    if (incomingImageData !== undefined && incomingImageMimetype !== undefined && incomingImageOriginalName !== undefined) {
      product.imageData = incomingImageData;
      product.imageMimetype = incomingImageMimetype;
      product.imageOriginalName = incomingImageOriginalName;
    }
    if (!product.imageData || !product.imageMimetype || !product.imageOriginalName) {
      throw new BadRequestException('Product image is required');
    }

    if (data.isFeatured !== undefined) {
      product.isFeatured = data.isFeatured === true || data.isFeatured === 'true';
    }

    const { categoryId, subcategoryId } = this.parseCategoryIds(data);
    if (categoryId === undefined || subcategoryId === undefined) {
      throw new BadRequestException('Category and subcategory are required');
    }
    await this.assertSubcategoryBelongsToCategory(categoryId, subcategoryId);
    product.category = { id: categoryId } as Category;
    product.subcategory = { id: subcategoryId } as Subcategory;

    await this.productRepo.save(product);

    const translationsPayload = this.parseTranslationsNested(data);
    if (translationsPayload) {
      const enName =
        translationsPayload.en?.name !== undefined
          ? String(translationsPayload.en.name).trim()
          : '';
      if (!enName) throw new BadRequestException('English product name is required');
      const enDesc =
        translationsPayload.en?.description !== undefined
          ? String(translationsPayload.en.description).trim()
          : '';
      if (!enDesc) throw new BadRequestException('English description is required');
      await this.assertUniqueEnglishName(enName, id);
      await this.saveProductTranslations(product, translationsPayload);
    } else {
      throw new BadRequestException('Translations are required');
    }

    return this.productRepo.findOne({
      where: { id },
      relations: ['translations', 'category', 'subcategory'],
    });
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
      imageUrl: `/api/products/${p.id}/image`,
      sortOrder: p.sortOrder,
      isFeatured: p.isFeatured,
      category: p.category
        ? {
            id: p.category.id,
            slug: p.category.slug,
            name: p.category.translations?.find((t) => t.lang === lang)?.name ?? p.category.slug,
          }
        : null,
      subcategory: p.subcategory ? { id: p.subcategory.id, slug: p.subcategory.slug } : null,
      name: t?.name ?? p.slug,
      description: t?.description ?? '',
      detailIntro: t?.detailIntro ?? '',
    };
  }

}
