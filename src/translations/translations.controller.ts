import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BatchUpsertTranslationsDto } from './translation.dto';

@Controller()
export class TranslationsController {
  constructor(private readonly service: TranslationsService) {}

  @Get('translations/:lang')
  getOverrides(@Param('lang') lang: string) {
    return this.service.getOverrides(lang);
  }

  @Get('admin/translations')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Post('admin/translations')
  @UseGuards(JwtAuthGuard)
  upsert(@Body() body: BatchUpsertTranslationsDto) {
    return this.service.batchUpsert(body.items);
  }
}
