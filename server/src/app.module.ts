import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';

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
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
