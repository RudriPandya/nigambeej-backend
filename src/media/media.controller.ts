import { Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateMediaDto } from './media.dto';

@Controller()
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Get('media/:id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const media = await this.service.findOneWithImage(+id);
    if (!media) {
      return res.status(404).send('Image not found');
    }
    res.set({
      'Content-Type': media.mimetype,
      'Content-Disposition': `inline; filename="${media.originalName}"`,
    });
    res.send(media.imageData);
  }

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
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateMediaDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = { altText: body.altText };
    if (file) {
      data.imageData = file.buffer;
      data.mimetype = file.mimetype;
      data.originalName = file.originalname;
    }
    return this.service.create(data);
  }

  @Delete('admin/media/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
