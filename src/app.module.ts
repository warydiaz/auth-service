import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { envValidationSchema } from './infrastructure/config/env.validation';
import { HealthController } from './infrastructure/http/routes/health.routes';
import { UserController } from './infrastructure/http/routes/auth/auth.controller';
import { RegisterUseCase } from './application/auth/register-user';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { PrismaUserRepository } from './infrastructure/database/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password-hasher';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
} from './infrastructure/tokens';
import { JwtTokenGenerator } from './infrastructure/auth/jwt-token.generator';
import { JwksService } from './infrastructure/auth/jwks.service';
import { WellKnownController } from './infrastructure/http/routes/well-known/well-known.controller';
import { LoginUseCase } from './application/auth/login-user';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    JwtModule.register({}),
  ],
  controllers: [HealthController, UserController, WellKnownController],
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    RegisterUseCase,
    LoginUseCase,
    JwksService,
  ],
})
export class AppModule {}
