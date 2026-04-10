import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateGalleryDto, UpdateGalleryDto } from './gallery.dto';

@Controller()
export class GalleryController {
  constructor(private readonly service: GalleryService) {}

  @Get('gallery')
  getAll(@Query('tab') tab: string) {
    return this.service.findAll(tab);
  }

  @Get('admin/gallery')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Post('admin/gallery')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('gallery'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateGalleryDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = { tabKey: body.tabKey ?? 'all', altText: body.altText };
    if (file) data.imagePath = `gallery/${file.filename}`;
    return this.service.create(data);
  }

  @Put('admin/gallery/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: UpdateGalleryDto) {
    return this.service.update(+id, body);
  }

  @Delete('admin/gallery/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
