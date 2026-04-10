import { Controller, Get, Put, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { UploadSettingImageDto } from './settings.dto';

@Controller()
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('settings')
  getAll() {
    return this.service.findAll();
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard)
  adminGetAll() {
    return this.service.findAll();
  }

  @Put('admin/settings')
  @UseGuards(JwtAuthGuard)
  batchUpdate(@Body() body: Record<string, string>) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Settings must be a key-value object');
    }
    return this.service.batchUpsert(body);
  }

  @Post('admin/settings/about-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('about'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  async uploadAboutImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file is required');
    const imagePath = `about/${file.filename}`;
    await this.service.upsert('about_image', imagePath);
    return { imagePath };
  }

  @Post('admin/settings/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('settings'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  async uploadImage(@Body() body: UploadSettingImageDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file is required');
    if (!body.key) throw new BadRequestException('Key is required');
    const imagePath = `settings/${file.filename}`;
    await this.service.upsert(body.key, imagePath);
    return { imagePath };
  }
}
