import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, Patch, Res, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage, imageFileFilter, MAX_IMAGE_SIZE } from '../common/multer.config';
import { CreateProductDto, UpdateProductDto, UpsertPracticeDto } from './product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // Public
  @Get('products')
  getAll(
    @Query('lang') lang: string,
    @Query('category') cat: string,
    @Query('subcategory') sub: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const usePagination = pageRaw !== undefined && pageRaw !== '';
    const page = usePagination ? Math.max(1, parseInt(String(pageRaw), 10) || 1) : undefined;
    const limit =
      usePagination && limitRaw !== undefined && limitRaw !== ''
        ? Math.min(100, Math.max(1, parseInt(String(limitRaw), 10) || 24))
        : usePagination
          ? 24
          : undefined;
    return this.service.findAll(lang, cat, sub, page, limit);
  }

  @Get('products/featured')
  getFeatured(@Query('lang') lang: string) {
    return this.service.findFeatured(lang);
  }

  @Get('products/:slug')
  getOne(@Param('slug') slug: string, @Query('lang') lang: string) {
    return this.service.findBySlug(slug, lang);
  }

  @Get('practices')
  getPractices(@Query('lang') lang: string) {
    return this.service.findPractices(lang);
  }

  @Get('practices/:slug')
  getPracticeBySlug(@Param('slug') slug: string, @Query('lang') lang: string) {
    return this.service.findPracticeBySlug(slug, lang);
  }

  @Get('products/:id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const product = await this.service.findOneWithImage(+id);
    if (!product || !product.imageData) {
      return res.status(404).send('Image not found');
    }
    res.set({
      'Content-Type': product.imageMimetype,
      'Content-Disposition': `inline; filename="${product.imageOriginalName}"`,
    });
    res.send(product.imageData);
  }

  @Get('products/:id/practice-image')
  async getPracticeImage(@Param('id') id: string, @Res() res: Response) {
    const product = await this.service.findOneWithPracticeImage(+id);
    if (!product || !product.practiceImageData) {
      return res.status(404).send('Practice image not found');
    }
    res.set({
      'Content-Type': product.practiceImageMimetype,
      'Content-Disposition': `inline; filename="${product.practiceImageOriginalName}"`,
    });
    res.send(product.practiceImageData);
  }

  @Get('categories')
  getCategories(@Query('lang') lang: string) {
    return this.service.getCategories(lang);
  }

  // Admin
  @Get('admin/products')
  @UseGuards(JwtAuthGuard)
  adminList(@Query('page') pageRaw?: string, @Query('limit') limitRaw?: string) {
    const page = Math.max(1, parseInt(String(pageRaw ?? '1'), 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(String(limitRaw ?? '10'), 10) || 10));
    return this.service.findAllAdmin(page, limit);
  }

  @Get('admin/practices/candidates')
  @UseGuards(JwtAuthGuard)
  practiceCandidates(@Query('lang') lang: string) {
    return this.service.findPracticeCandidates(lang || 'en');
  }

  @Get('admin/practices')
  @UseGuards(JwtAuthGuard)
  adminPractices(@Query('lang') lang: string) {
    return this.service.findAllPracticesAdmin(lang || 'en');
  }

  @Post('admin/practices')
  @UseGuards(JwtAuthGuard)
  createPractice(@Body() body: UpsertPracticeDto) {
    return this.service.createPractice(body as unknown as Record<string, unknown>);
  }

  @Put('admin/practices/:id')
  @UseGuards(JwtAuthGuard)
  updatePractice(@Param('id') id: string, @Body() body: UpsertPracticeDto) {
    return this.service.updatePractice(
      +id,
      { ...(body as unknown as Record<string, unknown>), productId: +id },
    );
  }

  @Delete('admin/practices/:id')
  @UseGuards(JwtAuthGuard)
  removePractice(@Param('id') id: string) {
    return this.service.removePractice(+id);
  }

  @Put('admin/practices/:id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  async uploadPracticeImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    await this.service.updatePracticeImage(+id, file.buffer, file.mimetype, file.originalname);
    return { ok: true };
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  create(@Body() body: CreateProductDto, @UploadedFile() file?: Express.Multer.File) {
    const data: Record<string, unknown> = { ...body };
    if (file) {
      data.imageData = file.buffer;
      data.imageMimetype = file.mimetype;
      data.imageOriginalName = file.originalname;
    }
    return this.service.create(data as any);
  }

  @Put('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: createMulterStorage(), fileFilter: imageFileFilter, limits: { fileSize: MAX_IMAGE_SIZE } }))
  update(@Param('id') id: string, @Body() body: UpdateProductDto, @UploadedFile() file?: Express.Multer.File) {
    const data: Record<string, unknown> = { ...body };
    if (file) {
      data.imageData = file.buffer;
      data.imageMimetype = file.mimetype;
      data.imageOriginalName = file.originalname;
    }
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
