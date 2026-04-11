import { Controller, Post, Body, Res, Get, Req, UseGuards, HttpCode } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './login.dto';
import { getAuthCookieClearOptions, getAuthCookieSetOptions } from './auth-cookie-options';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(dto.email, dto.password);
    res.cookie('access_token', token, getAuthCookieSetOptions());
    return { success: true, user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', getAuthCookieClearOptions());
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request & { user: any }) {
    const user = await this.authService.findById(req.user.sub);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
