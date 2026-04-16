import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { InformationService, CardSaveItem } from './information.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class InformationController {
  constructor(private readonly service: InformationService) {}

  @Get('information-cards')
  findAll(@Query('lang') lang: string) {
    return this.service.findAll(lang ?? 'en');
  }

  @Get('admin/information-cards')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Put('admin/information-cards')
  @UseGuards(JwtAuthGuard)
  batchSave(@Body() body: { cards: CardSaveItem[] }) {
    return this.service.batchSave(body?.cards ?? []);
  }
}
