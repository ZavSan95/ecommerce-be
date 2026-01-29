import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { mapAxiosError } from '../common/utils/http-error.mapper';
import { ProductService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('catalog/products')
export class ProductsController {

  constructor(
    private readonly productService: ProductService,
  ) {}

  // ---------------------------
  // GET ALL
  // ---------------------------
  @Public()
  @Get()
  async getAll(@Query() pagination: PaginationDto) {
    return this.productService.getAll(pagination);
  }

  // ---------------------------
  // GET PRODUCTS BY CATEGORY SLUG
  // ---------------------------
  @Public()
  @Get('category/:slug')
  async getByCategorySlug(@Param('slug') slug: string) {
    return this.productService.getByCategorySlug(slug);
  }

  // ---------------------------
  // GET PRODUCT BY PRODUCT SLUG (SKU)
  // ---------------------------
  @Public()
  @Get('slug/:slug')
  async getByProductSlug(@Param('slug') slug: string) {
    return this.productService.getByProductSlug(slug);
}

  // ---------------------------
  // CREATE PRODUCT
  // ---------------------------
  @Public()
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

  // ---------------------------
  // UPDATE
  // ---------------------------
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    try {
      const updatedProduct = await this.productService.patch(id, dto);

      return {
        message: `Producto ID: ${id} actualizado correctamente`,
        data: updatedProduct,
      };
    } catch (error) {
      mapAxiosError(error);
    }
  }

  // ---------------------------
  // DELETE
  // ---------------------------
  @Delete(':id')
  async delete(@Param() params: ProductIdParamDto) {
    try {
      const deletedProduct = await this.productService.delete(params);

      return {
        message: `Producto ID: ${params.id} eliminado correctamente`,
        data: deletedProduct,
      };
    } catch (error) {
      mapAxiosError(error);
    }
  }
}
