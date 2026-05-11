import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BaseErrorFilter } from './infrastructure/http/filters/base-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new BaseErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
