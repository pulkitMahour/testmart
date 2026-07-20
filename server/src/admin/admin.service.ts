import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly users: UsersService,
    private readonly products: ProductsService,
    private readonly orders: OrdersService,
  ) {}

  async getStats() {
    const [users, products, orders, revenue] = await Promise.all([
      this.users.count(),
      this.products.count(),
      this.orders.count(),
      this.orders.revenue(),
    ]);
    return { users, products, orders, revenue };
  }
}
