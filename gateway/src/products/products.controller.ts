import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { mapAxiosError } from '../common/utils/http-error.mapper';
import { ProductService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';


@Controller('catalog/products')
@UseGuards(RolesGuard, PermissionsGuard)
export class ProductsController {

  constructor(
    private readonly productService: ProductService
  ) {}

  @Get()
  findAll() {
    return { message: 'Productos públicos (logueado)' };
  }

  @Get('admin')
  @Roles('admin')
  getAdminData() {
    return { message: 'Solo admin' };
  }

  @Get('create')
  @Permissions('products:create')
  createProduct() {
    return { message: 'Crear producto' };
  }

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
