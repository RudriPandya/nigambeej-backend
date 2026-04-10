import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerApplication } from '../entities/career-application.entity';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CareerApplication]), AuthModule],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
