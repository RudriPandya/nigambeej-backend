import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(SiteSetting) private readonly repo: Repository<SiteSetting>) {}

  async findAll(): Promise<Record<string, string>> {
    const all = await this.repo.find();
    return Object.fromEntries(all.map((s) => [s.settingKey, s.settingValue]));
  }

  async upsert(key: string, value: string) {
    const existing = await this.repo.findOne({ where: { settingKey: key } });
    if (existing) {
      existing.settingValue = value;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ settingKey: key, settingValue: value }));
  }

  async batchUpsert(data: Record<string, string>) {
    const results = await Promise.all(
      Object.entries(data).map(([key, value]) => this.upsert(key, value)),
    );
    return results;
  }
}
