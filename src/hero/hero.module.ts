import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from '../entities/hero-slide.entity';
import { HeroSlideTranslation } from '../entities/hero-slide-translation.entity';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([HeroSlide, HeroSlideTranslation]), AuthModule],
  controllers: [HeroController],
  providers: [HeroService],
})
export class HeroModule {}
