import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './infrastructure/config/env.validation';
import { HealthController } from './infrastructure/http/routes/health.routes';
import { UserController } from './infrastructure/http/routes/auth/auth.controller';
import { RegisterUseCase } from './application/auth/register-user';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { PrismaUserRepository } from './infrastructure/database/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password-hasher';
import { USER_REPOSITORY, PASSWORD_HASHER } from './infrastructure/tokens';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
  controllers: [HealthController, UserController],
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    RegisterUseCase,
  ],
})
export class AppModule {}
