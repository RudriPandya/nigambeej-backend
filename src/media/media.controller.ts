import { Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateMediaDto } from './media.dto';

@Controller()
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Get('media')
  getAll() {
    return this.service.findAll();
  }

  @Get('admin/media')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAll();
  }

  @Post('admin/media')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('media'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateMediaDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = { altText: body.altText };
    if (file) data.imagePath = `media/${file.filename}`;
    return this.service.create(data);
  }

  @Delete('admin/media/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
