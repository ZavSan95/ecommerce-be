import { Body, Controller, Get, Post } from '@nestjs/common';
import type {
  CreateProductDto,
  GetProductResponse,
} from '@ecommerce/contracts';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto): GetProductResponse {
    const product = this.service.create(dto);
    return { product };
  }

  @Get()
  list() {
    return {
      items: this.service.findAll(),
    };
  }
}
