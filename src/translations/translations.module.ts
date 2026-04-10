import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationOverride } from '../entities/translation-override.entity';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TranslationOverride]), AuthModule],
  controllers: [TranslationsController],
  providers: [TranslationsService],
})
export class TranslationsModule {}
