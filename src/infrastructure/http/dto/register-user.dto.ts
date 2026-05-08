import { IsEmail, isNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @isNotEmpty()
  @IsString()
  name: string;

  @isNotEmpty()
  @IsEmail()
  email: string;

  @isNotEmpty()
  @MinLength(8)
  @IsString()
  password: string;
}
