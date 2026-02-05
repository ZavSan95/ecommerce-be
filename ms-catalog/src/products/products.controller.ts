import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { ValidateCheckoutDto } from './dto/validate-checkout.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
  async getAll(pagination: PaginationDto) {
    return this.productsService.getAll(pagination);
  }

  @MessagePattern('products.get.slug')
  async getBySlugCategory(@Payload() slug: string) {
    return this.productsService.getBySlugCategory(slug);
  }

  @MessagePattern('products.get.slug.product')
  async getBySlugProduct(@Payload() slug: string) {
    return this.productsService.getBySlugProduct(slug);
  }

  @MessagePattern('product.get.id')
  async getById(@Payload() id: string){
    return this.productsService.getById(id);
  }

  @MessagePattern('product.related')
  async getProductsRelated(@Payload() slug: string){
    return this.productsService.getProductsRelated(slug);
  }

  @MessagePattern('products.checkout.validate')
  async validateForCheckout(@Payload() dto: ValidateCheckoutDto) {
    return this.productsService.validateForCheckout(dto);
  }

  @MessagePattern('catalog.products.search')
  searchProducts(
    @Payload() payload: { query: string },
  ) {
    return this.productsService.search(payload.query);
  }

  
}
