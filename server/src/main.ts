import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Default to an in-memory MongoDB when no real MONGO_URI is provided.
  if (!process.env.MONGO_URI) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    process.env.MONGO_URI = mem.getUri();
    console.log('🧪 In-memory MongoDB started');
  }

  const app = await NestFactory.create(AppModule);

  // Behind a reverse proxy (e.g. Render) — so rate limiting sees the real client IP.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  const port = Number(process.env.PORT) || 5000;
  await app.listen(port);
  console.log(`🚀 TestMart API running on http://localhost:${port}/api`);
}

bootstrap();
