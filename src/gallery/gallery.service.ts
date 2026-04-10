import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryImage } from '../entities/gallery-image.entity';

@Injectable()
export class GalleryService {
  constructor(@InjectRepository(GalleryImage) private readonly repo: Repository<GalleryImage>) {}

  findAll(tab?: string) {
    const where: any = { isActive: true };
    if (tab && tab !== 'all') where.tabKey = tab;
    return this.repo.find({ where, order: { sortOrder: 'ASC' } });
  }

  findAllAdmin() {
    return this.repo.find({ order: { tabKey: 'ASC', sortOrder: 'ASC' } });
  }

  create(data: Partial<GalleryImage>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<GalleryImage>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    const img = await this.repo.findOne({ where: { id } });
    if (!img) throw new NotFoundException();
    await this.repo.delete(id);
    return { deleted: true };
  }
}
