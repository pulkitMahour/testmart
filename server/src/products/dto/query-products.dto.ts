import { IsIn, IsOptional, IsString } from 'class-validator';

export const PRODUCT_SORTS = ['price-asc', 'price-desc', 'newest', 'rating'] as const;

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(PRODUCT_SORTS)
  sort?: (typeof PRODUCT_SORTS)[number];

  // Query params arrive as strings; parsed to numbers in the service.
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
