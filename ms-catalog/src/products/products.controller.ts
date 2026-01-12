import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller()
export class ProductsController {
  constructor() {}

  @MessagePattern('products.create')
  create(@Payload() dto: CreateProductDto) {
    console.log('📥 MS Products CREATE:', dto);
    //return this.productsService.create(dto);
  }
}
