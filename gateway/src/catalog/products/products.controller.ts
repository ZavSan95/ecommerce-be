import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { mapAxiosError } from '../../common/utils/http-error.mapper';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly http: HttpService) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const baseUrl = process.env.CATALOG_URL ?? 'http://localhost:3001';

    try {
      const response = await firstValueFrom(
        this.http.post(`${baseUrl}/products`, dto),
      );
      return response.data;
    } catch (error) {
      mapAxiosError(error); // 👈 NO return, NO throw doble
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const baseUrl = process.env.CATALOG_URL ?? 'http://localhost:3001';

    console.log('DTO EN GATEWAY:', dto);

    try {
      const response = await firstValueFrom(
        this.http.patch(`${baseUrl}/products/${id}`, dto),
      );
      return response.data;
    } catch (error) {
      mapAxiosError(error);
    }
  }

}
