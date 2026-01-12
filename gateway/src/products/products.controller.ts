import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { mapAxiosError } from '../common/utils/http-error.mapper';
import { ProductService } from './products.service';

@Controller('catalog/products')
export class ProductsController {

  constructor(
    private readonly productService: ProductService
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {

    try {
      this.productService.create(dto)
    } catch (error) {
      mapAxiosError(error); 
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      this.productService.patch(id, dto);
    } catch (error) {
      mapAxiosError(error);
    }
  }

  @Delete(':id')
  async delete(@Param() params: ProductIdParamDto){
    try {
      this.productService.delete(params);
    } catch (error) {
      mapAxiosError(error);
    }
  }

}
