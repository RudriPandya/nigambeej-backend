import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { HeroService } from './hero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateHeroDto, UpdateHeroDto } from './hero.dto';

@Controller()
export class HeroController {
  constructor(private readonly service: HeroService) {}

  @Get('hero/:id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const slide = await this.service.findOneWithImage(+id);
    if (!slide || !slide.imageData) {
      return res.status(404).send('Image not found');
    }
    res.set({
      'Content-Type': slide.imageMimetype,
      'Content-Disposition': `inline; filename="${slide.imageOriginalName}"`,
    });
    res.send(slide.imageData);
  }

  @Get('hero')
  getAll(@Query('lang') lang: string) {
    return this.service.findAll(lang);
  }

  @Get('admin/hero')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Post('admin/hero')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateHeroDto, @UploadedFile() file?: Express.Multer.File) {
    const data = { ...body };
    if (file) {
      data.imageData = file.buffer;
      data.imageMimetype = file.mimetype;
      data.imageOriginalName = file.originalname;
    }
    return this.service.create(data);
  }

  @Put('admin/hero/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  update(@Param('id') id: string, @Body() body: UpdateHeroDto, @UploadedFile() file?: Express.Multer.File) {
    const data = { ...body };
    if (file) {
      data.imageData = file.buffer;
      data.imageMimetype = file.mimetype;
      data.imageOriginalName = file.originalname;
    }
    return this.service.update(+id, data);
  }

  @Delete('admin/hero/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
