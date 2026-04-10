import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomepageStat } from '../entities/homepage-stat.entity';

@Injectable()
export class StatsService {
  constructor(@InjectRepository(HomepageStat) private readonly repo: Repository<HomepageStat>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  findAllAdmin() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  create(data: Partial<HomepageStat>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<HomepageStat>) {
    const stat = await this.repo.findOne({ where: { id } });
    if (!stat) throw new NotFoundException();
    Object.assign(stat, data);
    return this.repo.save(stat);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
