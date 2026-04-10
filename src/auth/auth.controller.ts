import { Controller, Post, Body, Res, Get, Req, UseGuards, HttpCode } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd ? '.nigambeej.com' : 'localhost';
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain,
    } as const;

    const { token, user } = await this.authService.login(dto.email, dto.password);
    res.cookie('access_token', token, cookieOptions);
    return { success: true, user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd ? '.nigambeej.com' : 'localhost';
    res.clearCookie('access_token', {
      path: '/',
      domain,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
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
