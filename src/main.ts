import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as express from 'express';
import { getUploadsRoot } from './common/multer.config';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim());

  const app = await NestFactory.create(AppModule, {
    cors: {
      // In dev: reflect any origin (allows all localhost ports).
      // In prod: only explicitly listed origins.
      origin: isDev ? true : corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Set-Cookie'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.setGlobalPrefix('api');

  // Serve uploaded files from the persistent uploads directory
  app.use('/uploads', express.static(getUploadsRoot()));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
