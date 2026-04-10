import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaImage } from '../entities/media-image.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(MediaImage) private readonly repo: Repository<MediaImage>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  create(data: Partial<MediaImage>) {
    return this.repo.save(this.repo.create(data));
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
