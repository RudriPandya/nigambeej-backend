import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVideoDto, UpdateVideoDto } from './video.dto';

@Controller()
export class VideosController {
  constructor(private readonly service: VideosService) {}

  @Get('videos')
  getAll(@Query('lang') lang: string) {
    return this.service.findAll(lang);
  }

  @Get('admin/videos')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Post('admin/videos')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateVideoDto) {
    return this.service.create(body);
  }

  @Put('admin/videos/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: UpdateVideoDto) {
    return this.service.update(+id, body);
  }

  @Delete('admin/videos/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
