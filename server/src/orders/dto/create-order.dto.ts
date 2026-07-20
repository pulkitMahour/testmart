import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class OrderItemInput {
  @IsMongoId()
  product: string;

  @IsInt()
  @Min(1)
  qty: number;
}

class ShippingAddressDto {
  @IsString() fullName: string;
  @IsString() street: string;
  @IsString() city: string;
  @IsString() postalCode: string;
  @IsString() country: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
