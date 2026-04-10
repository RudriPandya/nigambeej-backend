import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { join } from 'path';
import { CareersService } from './careers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createMulterStorage } from '../common/multer.config';
import { CreateCareerDto } from './create-career.dto';

const ALLOWED_CV_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB

function cvFileFilter(req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (!ALLOWED_CV_MIMETYPES.includes(file.mimetype)) {
    return cb(new BadRequestException('Only PDF, DOC, and DOCX files are allowed for CV'), false);
  }
  cb(null, true);
}

@Controller()
export class CareersController {
  constructor(private readonly service: CareersService) {}

  @Post('careers')
  @UseInterceptors(FileInterceptor('cv', { storage: createMulterStorage('cvs'), fileFilter: cvFileFilter, limits: { fileSize: MAX_CV_SIZE } }))
  submit(@Body() body: CreateCareerDto, @UploadedFile() file?: Express.Multer.File) {
    const data: Record<string, unknown> = { ...body };
    if (file) data.cvFilePath = `cvs/${file.filename}`;
    return this.service.submit(data as any);
  }

  @Get('admin/careers')
  @UseGuards(JwtAuthGuard)
  async list(@Query('page') page: string, @Query('limit') limit: string) {
    const [data, total] = await this.service.findAll(+page || 1, +limit || 20);
    return { data, total };
  }

  @Patch('admin/careers/:id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Param('id') id: string) {
    return this.service.markRead(+id);
  }

  @Get('admin/careers/:id/cv')
  @UseGuards(JwtAuthGuard)
  async downloadCv(@Param('id') id: string, @Res() res: Response) {
    const app = await this.service.findOne(+id);
    if (!app?.cvFilePath) return res.status(404).json({ error: 'CV not found' });
    return res.download(join(process.cwd(), 'uploads', app.cvFilePath));
  }
}
