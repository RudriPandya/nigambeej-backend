import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaImage } from '../entities/media-image.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(MediaImage) private readonly repo: Repository<MediaImage>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } }).then(items =>
      items.map(item => ({ ...item, imageUrl: `/api/media/${item.id}/image` }))
    );
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id, isActive: true } });
  }

  findOneWithImage(id: number) {
    return this.repo.findOne({ where: { id, isActive: true }, select: ['id', 'imageData', 'mimetype', 'originalName', 'altText', 'sortOrder', 'isActive'] });
  }

  create(data: Partial<MediaImage>) {
    return this.repo.save(this.repo.create(data));
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
