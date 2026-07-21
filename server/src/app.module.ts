import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // When SERVE_CLIENT=true the API also serves the built React client (single-service
    // deploy). Returns [] otherwise, so dev is unaffected (Vite serves the client there).
    ServeStaticModule.forRootAsync({
      useFactory: () => {
        if (process.env.SERVE_CLIENT !== 'true') return [];
        return [
          {
            rootPath: join(__dirname, '..', '..', 'client', 'dist'),
            exclude: ['/api/(.*)'],
          },
        ];
      },
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGO_URI }),
    }),
    // Rate limiting. The global guard is only registered when RATE_LIMIT_ENABLED=true
    // (set on the public deploy), so local/CI test runs are never throttled.
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: Number(process.env.RATE_LIMIT_TTL) || 60000,
          limit: Number(process.env.RATE_LIMIT_MAX) || 100,
        },
      ],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    SeedModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [
    ...(process.env.RATE_LIMIT_ENABLED === 'true'
      ? [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
      : []),
  ],
})
export class AppModule {}
