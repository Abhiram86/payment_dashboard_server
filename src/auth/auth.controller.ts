import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { type Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginUser(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async createUser(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.user as { id: number };
    if (!token) return null;
    return await this.authService.getUser(token.id);
  }
}
