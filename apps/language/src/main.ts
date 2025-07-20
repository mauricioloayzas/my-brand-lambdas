import { NestFactory } from '@nestjs/core';
import { LanguageModule } from './language.module';

async function bootstrap() {
  const app = await NestFactory.create(LanguageModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
