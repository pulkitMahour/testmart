import { IsIn } from 'class-validator';
import { ORDER_STATUSES } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES as unknown as string[])
  status: string;
}
