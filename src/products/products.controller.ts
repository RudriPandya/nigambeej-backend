import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // Public
  @Get('products')
  getAll(@Query('lang') lang: string, @Query('category') cat: string, @Query('subcategory') sub: string) {
    return this.service.findAll(lang, cat, sub);
  }

  @Get('products/featured')
  getFeatured(@Query('lang') lang: string) {
    return this.service.findFeatured(lang);
  }

  @Get('products/:slug')
  getOne(@Param('slug') slug: string, @Query('lang') lang: string) {
    return this.service.findBySlug(slug, lang);
  }

  @Get('categories')
  getCategories(@Query('lang') lang: string) {
    return this.service.getCategories(lang);
  }

  // Admin
  @Get('admin/products')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('products'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateProductDto, @UploadedFile() file?: Express.Multer.File) {
    const data: Record<string, unknown> = { ...body };
    if (file) data.imagePath = `products/${file.filename}`;
    return this.service.create(data as any);
  }

  @Put('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage('products'), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  update(@Param('id') id: string, @Body() body: UpdateProductDto, @UploadedFile() file?: Express.Multer.File) {
    const data: Record<string, unknown> = { ...body };
    if (file) data.imagePath = `products/${file.filename}`;
    return this.service.update(+id, data as any);
  }

  @Patch('admin/products/:id/featured')
  @UseGuards(JwtAuthGuard)
  toggleFeatured(@Param('id') id: string) {
    return this.service.toggleFeatured(+id);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
