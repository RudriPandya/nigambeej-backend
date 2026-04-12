import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';

@Controller()
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Get('blog')
  getAll(@Query('lang') lang: string, @Query('page') page: string, @Query('limit') limit: string) {
    return this.service.findAll(lang, +page || 1, +limit || 9);
  }

  @Get('blog/:slug')
  getOne(@Param('slug') slug: string, @Query('lang') lang: string) {
    return this.service.findBySlug(slug, lang);
  }

  @Get('admin/blog')
  @UseGuards(JwtAuthGuard)
  adminList(@Query('page') pageRaw?: string, @Query('limit') limitRaw?: string) {
    const page = Math.max(1, parseInt(String(pageRaw ?? '1'), 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(String(limitRaw ?? '10'), 10) || 10));
    return this.service.findAllAdmin(page, limit);
  }

  @Get('admin/blog/:id')
  @UseGuards(JwtAuthGuard)
  adminGet(@Param('id') id: string) {
    return this.service.findOneAdmin(+id);
  }

  @Post('admin/blog')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover', { storage: createMulterStorage('blog'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateBlogDto, @UploadedFile() file?: Express.Multer.File) {
    const data = { ...body };
    if (file) data.coverImage = `blog/${file.filename}`;
    return this.service.create(data);
  }

  @Put('admin/blog/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover', { storage: createMulterStorage('blog'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  update(@Param('id') id: string, @Body() body: UpdateBlogDto, @UploadedFile() file?: Express.Multer.File) {
    const data = { ...body };
    if (file) data.coverImage = `blog/${file.filename}`;
    return this.service.update(+id, data);
  }

  @Delete('admin/blog/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
