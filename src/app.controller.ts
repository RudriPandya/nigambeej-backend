import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): object {
    return { status: 'ok', service: 'Nigam Beej API' };
  }
}
