import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { mapAxiosError } from '../../common/utils/http-error.mapper';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';

@Controller('catalog/products')
export class ProductsController {

  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env.CATALOG_URL ?? 'http://localhost:3001';
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/products`, dto),
      );
      return response.data;
    } catch (error) {
      mapAxiosError(error); // 👈 NO return, NO throw doble
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      const response = await firstValueFrom(
        this.http.patch(`${this.baseUrl}/products/${id}`, dto),
      );
      return response.data;
    } catch (error) {
      mapAxiosError(error);
    }
  }

  @Delete(':id')
  async delete(@Param() params: ProductIdParamDto){
    try {
      const response = await firstValueFrom(
        this.http.delete(`${this.baseUrl}/products/${params.id}`)
      );
      return response.data;
    } catch (error) {
      mapAxiosError(error);
    }
  }

}
