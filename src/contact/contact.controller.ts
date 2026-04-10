import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateContactDto } from './create-contact.dto';

@Controller()
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Post('contact')
  submit(@Body() body: CreateContactDto) {
    return this.service.submit(body);
  }

  @Get('admin/inquiries')
  @UseGuards(JwtAuthGuard)
  async list(@Query('page') page: string, @Query('limit') limit: string) {
    const [data, total] = await this.service.findAll(+page || 1, +limit || 20);
    return { data, total };
  }

  @Patch('admin/inquiries/:id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Param('id') id: string) {
    return this.service.markRead(+id);
  }
}
