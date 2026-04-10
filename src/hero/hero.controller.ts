import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HeroService } from './hero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateHeroDto, UpdateHeroDto } from './hero.dto';

@Controller()
export class HeroController {
  constructor(private readonly service: HeroService) {}

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
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('hero'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateHeroDto, @UploadedFile() file?: Express.Multer.File) {
    const data = { ...body };
    if (file) data.imagePath = `hero/${file.filename}`;
    return this.service.create(data);
  }

  @Put('admin/hero/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('hero'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  update(@Param('id') id: string, @Body() body: UpdateHeroDto, @UploadedFile() file?: Express.Multer.File) {
    const data = { ...body };
    if (file) data.imagePath = `hero/${file.filename}`;
    return this.service.update(+id, data);
  }

  @Delete('admin/hero/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
