import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';

const round2 = (n: number) => Math.round(n * 100) / 100;
const TAX_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 10;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly products: ProductsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Build line items from the DB — never trust client-supplied names/prices.
    const orderItems = [];
    let itemsPrice = 0;

    for (const line of dto.items) {
      const product = await this.products.findOne(line.product); // 404 if missing
      if (product.countInStock < line.qty) {
        throw new BadRequestException(
          `Not enough stock for "${product.name}" (${product.countInStock} left)`,
        );
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: line.qty,
        image: product.image,
      });
      itemsPrice += product.price * line.qty;
    }

    itemsPrice = round2(itemsPrice);
    const taxPrice = round2(itemsPrice * TAX_RATE);
    const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

    // Commit stock atomically; roll back on any shortfall lost to a race.
    for (const item of orderItems) {
      const ok = await this.products.decrementStock(String(item.product), item.qty);
      if (!ok) {
        throw new BadRequestException(`Not enough stock for "${item.name}"`);
      }
    }

    return this.orderModel.create({
      user: userId,
      orderItems,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod || 'Mock',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true, // mock payment always succeeds
      paidAt: new Date(),
      status: 'processing',
    });
  }

  findMine(userId: string) {
    return this.orderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, user: { id: string; role: string }) {
    if (!isValidObjectId(id)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (String(order.user) !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to view this order');
    }
    return order;
  }

  // ---- Admin operations ----

  count() {
    return this.orderModel.countDocuments();
  }

  async revenue(): Promise<number> {
    const [agg] = await this.orderModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    return round2(agg?.total || 0);
  }

  findAll() {
    return this.orderModel.find().populate('user', 'name email').sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
