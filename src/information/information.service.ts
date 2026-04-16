import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformationCard } from '../entities/information-card.entity';

export interface CardSaveItem {
  id?: number;
  image?: string | null;
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
    const cards = await this.repo.find({ order: { sortOrder: 'ASC' } });
    return cards.map((c) => this.format(c, lang));
  }

  findAllAdmin() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
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

    // Upsert each card in order
    const saved: InformationCard[] = [];
    for (const card of cards) {
      if (card.id != null && existingIds.has(card.id)) {
        await this.repo.update(card.id, this.toRow(card));
        const updated = await this.repo.findOne({ where: { id: card.id } });
        if (updated) saved.push(updated);
      } else {
        const created = await this.repo.save(this.repo.create(this.toRow(card)));
        saved.push(created);
      }
    }

    return saved;
  }

  private toRow(card: CardSaveItem) {
    return {
      image: card.image ?? null,
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

  private format(c: InformationCard, lang: string) {
    const title =
      (lang === 'hi' ? c.hiTitle : lang === 'gu' ? c.guTitle : null) || c.enTitle;
    const desc =
      (lang === 'hi' ? c.hiDesc : lang === 'gu' ? c.guDesc : null) || c.enDesc;
    return {
      id: c.id,
      image: c.image,
      btnUrl: c.btnUrl,
      isHomeCard: c.isHomeCard,
      sortOrder: c.sortOrder,
      title: title ?? '',
      desc: desc ?? '',
    };
  }
}
