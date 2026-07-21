import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { SEED_PRODUCTS, SEED_USERS } from '../seed/seed-data';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  /** Wipe all collections and re-seed to the known deterministic state. */
  async reset() {
    await Promise.all([
      this.userModel.deleteMany({}),
      this.productModel.deleteMany({}),
      this.orderModel.deleteMany({}),
    ]);
    await this.userModel.create(SEED_USERS); // create() runs the password-hashing hook
    await this.productModel.insertMany(SEED_PRODUCTS);
    return {
      message: 'Database reset to seed state',
      users: await this.userModel.countDocuments(),
      products: await this.productModel.countDocuments(),
      orders: await this.orderModel.countDocuments(),
    };
  }
}
