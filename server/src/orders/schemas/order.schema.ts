import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop()
  image: string;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop() fullName: string;
  @Prop() street: string;
  @Prop() city: string;
  @Prop() postalCode: string;
  @Prop() country: string;
}
const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  orderItems: OrderItem[];

  @Prop({ type: ShippingAddressSchema })
  shippingAddress: ShippingAddress;

  @Prop({ default: 'Mock' })
  paymentMethod: string;

  @Prop({ default: 0 })
  itemsPrice: number;

  @Prop({ default: 0 })
  taxPrice: number;

  @Prop({ default: 0 })
  shippingPrice: number;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt: Date;

  @Prop({ type: String, enum: ORDER_STATUSES, default: 'pending' })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
