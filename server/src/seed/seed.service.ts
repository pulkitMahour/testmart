import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Product } from '../products/schemas/product.schema';
import { SEED_PRODUCTS, SEED_USERS } from './seed-data';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger('Seed');

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedProducts();
  }

  private async seedUsers() {
    if ((await this.userModel.countDocuments()) > 0) return;
    // create() (not insertMany) so the password-hashing pre-save hook runs.
    await this.userModel.create(SEED_USERS);
    this.logger.log(
      `Seeded ${SEED_USERS.length} users (admin@demo.com / admin123, user@demo.com / user123)`,
    );
  }

  private async seedProducts() {
    if ((await this.productModel.countDocuments()) > 0) return;
    await this.productModel.insertMany(SEED_PRODUCTS);
    this.logger.log(`Seeded ${SEED_PRODUCTS.length} products`);
  }
}
