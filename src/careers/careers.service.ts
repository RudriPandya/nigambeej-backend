import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerApplication } from '../entities/career-application.entity';

@Injectable()
export class CareersService {
  constructor(@InjectRepository(CareerApplication) private readonly repo: Repository<CareerApplication>) {}

  submit(data: Partial<CareerApplication>) {
    return this.repo.save(this.repo.create(data));
  }

  findAll(page = 1, limit = 20) {
    return this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async markRead(id: number) {
    await this.repo.update(id, { isRead: true });
    return { success: true };
  }
}
