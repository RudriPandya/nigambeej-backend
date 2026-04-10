import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInquiry } from '../entities/contact-inquiry.entity';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactInquiry]), AuthModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
