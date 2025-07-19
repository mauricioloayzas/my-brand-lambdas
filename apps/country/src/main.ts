import { NestFactory } from '@nestjs/core';
import { CountryModule } from './country.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { ValidationPipe } from '@nestjs/common';
import { Express } from 'express'; // <-- 1. Importar Express

let server: Handler;

async function bootstrapServerless(): Promise<Handler> {
  const app = await NestFactory.create(CountryModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return serverlessExpress({ app: app.getHttpAdapter().getInstance() });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrapServerless());
  return server(event, context, callback) as unknown;
};

async function startLocal() {
  const app = await NestFactory.create(CountryModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startLocal().catch((err) =>
    console.error('Error starting local server:', err),
  );
}
