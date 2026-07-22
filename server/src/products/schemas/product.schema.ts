import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: '/images/placeholder.svg' })
  image: string;

  @Prop({ required: true, default: 0 })
  countInStock: number;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: false })
  featured: boolean;

  // Marks the deterministic demo data seeded on boot; seeded products cannot be deleted.
  @Prop({ default: false })
  isSeed: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
