import { Body, Controller, Delete, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { mapAxiosError } from '../common/utils/http-error.mapper';
import { ProductService } from './products.service';
import { firstValueFrom } from 'rxjs';

@Controller('catalog/products')
export class ProductsController {

  constructor(
    private readonly productService: ProductService
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateProductDto) {
    try {
      const product = await this.productService.create(dto);

      return {
        message: 'Producto creado correctamente',
        data: product,
      };

    } catch (error) {
      mapAxiosError(error);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      const updatedProduct = await this.productService.patch(id, dto);

      return {
        message: `Producto ID: ${id} actualizado correctamente`,
        data: updatedProduct
      };

    } catch (error) {
      mapAxiosError(error);
    }
  }

  @Delete(':id')
  async delete(@Param() params: ProductIdParamDto){
    try {

      const deletedProduct = await this.productService.delete(params);

      return {
        message: `Producto ID: ${params.id} eliminado correctamente`,
        data: deletedProduct
      }

    } catch (error) {
      mapAxiosError(error);
    }
  }

}
