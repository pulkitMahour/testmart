import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponse } from '../users/user.mapper';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orders.create(userId, dto);
  }

  // Declared before ':id' so "mine" isn't captured as an order id.
  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.orders.findMine(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserResponse) {
    return this.orders.findOne(id, user);
  }
}
