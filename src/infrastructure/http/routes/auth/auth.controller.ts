import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { RegisterUseCase } from 'src/application/auth/register-user';

@Controller()
export class UserController {
  constructor(private readonly authService: RegisterUseCase) {}
  @Post('auth/register')
  async register(@Body() dto: RegisterUserDto) {
    return await this.authService.execute(dto);
  }
}
