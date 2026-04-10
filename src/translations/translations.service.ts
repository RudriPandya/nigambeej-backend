import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationOverride } from '../entities/translation-override.entity';

@Injectable()
export class TranslationsService {
  constructor(@InjectRepository(TranslationOverride) private readonly repo: Repository<TranslationOverride>) {}

  async getOverrides(lang: string): Promise<Record<string, Record<string, string>>> {
    const overrides = await this.repo.find({ where: { lang } });
    const result: Record<string, Record<string, string>> = {};
    for (const o of overrides) {
      if (!result[o.namespace]) result[o.namespace] = {};
      result[o.namespace][o.keyPath] = o.value;
    }
    return result;
  }

  async upsert(lang: string, namespace: string, keyPath: string, value: string) {
    const existing = await this.repo.findOne({ where: { lang, namespace, keyPath } });
    if (existing) {
      existing.value = value;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ lang, namespace, keyPath, value }));
  }

  async batchUpsert(items: Array<{ lang: string; namespace: string; keyPath: string; value: string }>) {
    return Promise.all(items.map((i) => this.upsert(i.lang, i.namespace, i.keyPath, i.value)));
  }

  findAllAdmin() {
    return this.repo.find({ order: { lang: 'ASC', namespace: 'ASC' } });
  }
}
