import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '@org/data';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

@Post('register')
async register(@Body() dto: CreateUserDto) {
  await this.userService.create(dto.username, dto.password, 'Viewer', 2, dto.email);

  return { message: 'success' };
}
}