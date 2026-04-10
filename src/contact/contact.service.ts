import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInquiry } from '../entities/contact-inquiry.entity';

@Injectable()
export class ContactService {
  constructor(@InjectRepository(ContactInquiry) private readonly repo: Repository<ContactInquiry>) {}

  submit(data: Partial<ContactInquiry>) {
    return this.repo.save(this.repo.create(data));
  }

  findAll(page = 1, limit = 20) {
    return this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async markRead(id: number) {
    await this.repo.update(id, { isRead: true });
    return { success: true };
  }
}
