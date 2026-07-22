import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  newest: { createdAt: -1 },
  rating: { rating: -1 },
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: QueryProductsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));

    const filter: FilterQuery<ProductDocument> = {};
    if (query.keyword?.trim()) {
      filter.name = { $regex: query.keyword.trim(), $options: 'i' };
    }
    if (query.category && query.category !== 'all') {
      filter.category = query.category;
    }

    const sort = SORT_MAP[query.sort] || SORT_MAP.newest;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return { products, page, pages: Math.ceil(total / limit) || 1, total, limit };
  }

  async categories(): Promise<string[]> {
    const categories = await this.productModel.distinct('category');
    return categories.sort();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Product not found');
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /** Atomically decrement stock only if enough is available. Returns true on success. */
  async decrementStock(id: string, qty: number): Promise<boolean> {
    const res = await this.productModel.updateOne(
      { _id: id, countInStock: { $gte: qty } },
      { $inc: { countInStock: -qty } },
    );
    return res.modifiedCount === 1;
  }

  // ---- Admin operations ----

  count() {
    return this.productModel.countDocuments();
  }

  create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Product not found');
    const product = await this.productModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Product not found');
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (product.isSeed) {
      throw new ForbiddenException('Default products cannot be deleted');
    }
    await product.deleteOne();
    return { message: 'Product deleted', id };
  }
}
