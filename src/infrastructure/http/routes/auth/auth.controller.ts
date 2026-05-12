import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { RegisterUseCase } from 'src/application/auth/register-user';
import { LoginUserDto } from '../../dto/login-user.dto';
import { LoginUseCase } from 'src/application/auth/login-user';

@Controller()
export class UserController {
  constructor(
    private readonly authService: RegisterUseCase,
    private readonly loginService: LoginUseCase,
  ) {}
  @Post('auth/register')
  async register(@Body() dto: RegisterUserDto) {
    return await this.authService.execute(dto);
  }
  @Post('auth/login')
  async login(@Body() dto: LoginUserDto) {
    return await this.loginService.execute(dto);
  }
}
