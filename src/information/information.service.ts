import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformationCard } from '../entities/information-card.entity';

const ALL_FIELDS: (keyof InformationCard)[] = [
  'id', 'imageData', 'imageMimetype', 'imageOriginalName',
  'btnUrl', 'sortOrder', 'isHomeCard',
  'enTitle', 'enDesc', 'hiTitle', 'hiDesc', 'guTitle', 'guDesc',
];

export interface CardSaveItem {
  id?: number;
  btnUrl: string;
  sortOrder: number;
  isHomeCard: boolean;
  enTitle: string;
  enDesc?: string | null;
  hiTitle?: string | null;
  hiDesc?: string | null;
  guTitle?: string | null;
  guDesc?: string | null;
}

@Injectable()
export class InformationService {
  constructor(
    @InjectRepository(InformationCard)
    private readonly repo: Repository<InformationCard>,
  ) {}

  async findAll(lang = 'en') {
    const cards = await this.repo.find({
      order: { sortOrder: 'ASC' },
      select: ALL_FIELDS,
    });
    return cards.map((c) => this.format(c, lang));
  }

  async findAllAdmin() {
    const cards = await this.repo.find({
      order: { sortOrder: 'ASC' },
      select: ALL_FIELDS,
    });
    return cards.map((c) => this.formatAdmin(c));
  }

  async findOneWithImage(id: number) {
    return this.repo.findOne({
      where: { id },
      select: ['id', 'imageData', 'imageMimetype', 'imageOriginalName'],
    });
  }

  async updateImage(id: number, imageData: Buffer, imageMimetype: string, imageOriginalName: string) {
    const card = await this.repo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Card not found');
    await this.repo.update(id, { imageData, imageMimetype, imageOriginalName });
  }

  async batchSave(cards: CardSaveItem[]) {
    for (const card of cards) {
      if (!card.enTitle?.trim()) {
        throw new BadRequestException('English title is required for all cards');
      }
    }

    const existing = await this.repo.find();
    const existingIds = new Set(existing.map((c) => c.id));
    const incomingIds = new Set(cards.filter((c) => c.id != null).map((c) => c.id!));

    // Delete cards that were removed
    for (const id of existingIds) {
      if (!incomingIds.has(id)) {
        await this.repo.delete(id);
      }
    }

    // Upsert each card and collect saved IDs in order
    const savedIds: number[] = [];
    for (const card of cards) {
      if (card.id != null && existingIds.has(card.id)) {
        await this.repo.update(card.id, this.toRow(card));
        savedIds.push(card.id);
      } else {
        const created = await this.repo.save(this.repo.create(this.toRow(card)));
        savedIds.push(created.id);
      }
    }

    // Return formatted results in order
    const result = [];
    for (const id of savedIds) {
      const c = await this.repo.findOne({ where: { id }, select: ALL_FIELDS });
      if (c) result.push(this.formatAdmin(c));
    }
    return result;
  }

  private toRow(card: CardSaveItem) {
    return {
      btnUrl: card.btnUrl ?? '/information',
      sortOrder: card.sortOrder ?? 0,
      isHomeCard: card.isHomeCard ?? false,
      enTitle: card.enTitle.trim(),
      enDesc: card.enDesc ?? null,
      hiTitle: card.hiTitle ?? null,
      hiDesc: card.hiDesc ?? null,
      guTitle: card.guTitle ?? null,
      guDesc: card.guDesc ?? null,
    };
  }

  private formatAdmin(c: InformationCard) {
    return {
      id: c.id,
      imageUrl: c.imageData ? `/api/information-cards/${c.id}/image` : null,
      btnUrl: c.btnUrl,
      sortOrder: c.sortOrder,
      isHomeCard: c.isHomeCard,
      enTitle: c.enTitle,
      enDesc: c.enDesc,
      hiTitle: c.hiTitle,
      hiDesc: c.hiDesc,
      guTitle: c.guTitle,
      guDesc: c.guDesc,
    };
  }

  private format(c: InformationCard, lang: string) {
    const title =
      (lang === 'hi' ? c.hiTitle : lang === 'gu' ? c.guTitle : null) || c.enTitle;
    const desc =
      (lang === 'hi' ? c.hiDesc : lang === 'gu' ? c.guDesc : null) || c.enDesc;
    return {
      id: c.id,
      image: c.imageData ? `/api/information-cards/${c.id}/image` : null,
      btnUrl: c.btnUrl,
      isHomeCard: c.isHomeCard,
      sortOrder: c.sortOrder,
      title: title ?? '',
      desc: desc ?? '',
    };
  }
}
