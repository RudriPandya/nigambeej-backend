import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStatDto, UpdateStatDto } from './stat.dto';

@Controller()
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('stats')
  getAll() {
    return this.service.findAll();
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  adminList() {
    return this.service.findAllAdmin();
  }

  @Post('admin/stats')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateStatDto) {
    return this.service.create(body as any);
  }

  @Put('admin/stats/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: UpdateStatDto) {
    return this.service.update(+id, body as any);
  }

  @Delete('admin/stats/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
