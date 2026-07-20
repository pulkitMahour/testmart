import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly products: ProductsService,
    private readonly orders: OrdersService,
    private readonly users: UsersService,
  ) {}

  @Get('stats')
  stats() {
    return this.admin.getStats();
  }

  // ---- Products ----
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.products.remove(id);
  }

  // ---- Orders ----
  @Get('orders')
  listOrders() {
    return this.orders.findAll();
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  // ---- Users ----
  @Get('users')
  listUsers() {
    return this.users.findAllSafe();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser('id') requesterId: string) {
    return this.users.remove(id, requesterId);
  }
}
