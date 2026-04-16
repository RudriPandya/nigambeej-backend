import { BadRequestException, Body, Controller, Get, Param, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { InformationService, CardSaveItem } from './information.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';

@Controller()
export class InformationController {
  constructor(private readonly service: InformationService) {}

  @Get('information-cards/:id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const card = await this.service.findOneWithImage(+id);
    if (!card || !card.imageData) {
      return res.status(404).send('Image not found');
    }
    res.set({
      'Content-Type': card.imageMimetype,
      'Content-Disposition': `inline; filename="${card.imageOriginalName}"`,
    });
    res.send(card.imageData);
  }

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

  @Put('admin/information-cards/:id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    await this.service.updateImage(+id, file.buffer, file.mimetype, file.originalname);
    return { ok: true };
  }
}
