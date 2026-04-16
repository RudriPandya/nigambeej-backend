import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformationCard } from '../entities/information-card.entity';
import { InformationController } from './information.controller';
import { InformationService } from './information.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([InformationCard]), AuthModule],
  controllers: [InformationController],
  providers: [InformationService],
})
export class InformationModule {}
