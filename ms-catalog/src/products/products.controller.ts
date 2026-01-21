import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('products.create')
  async create(@Payload() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @MessagePattern('products.update')
  async update(
    @Payload() payload: { id: string; data: UpdateProductDto },
  ) {
    return this.productsService.update(payload.id, payload.data);
  }

  @MessagePattern('products.delete')
  async delete(
    @Payload() params: ProductIdParamDto
  ){
    return this.productsService.delete(params.id);
  }

  @MessagePattern('products.getAll')
  async getAll() {
    return this.productsService.getAll();
  }

  @MessagePattern('products.get.slug')
  async getBySlug(@Payload() slug: string) {
    return this.productsService.getBySlug(slug);
  }
}
