import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly userRepo: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ token: string; user: Partial<AdminUser> }> {
    const user = await this.userRepo.findOne({ where: { email, isActive: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.userRepo.update(user.id, { lastLogin: new Date() });

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async findById(id: number): Promise<AdminUser | null> {
    return this.userRepo.findOne({ where: { id, isActive: true } });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
