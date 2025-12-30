import { Body, Controller, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly http: HttpService) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const catalogUrl = process.env.CATALOG_URL ?? 'http://localhost:3001';

    const response = await firstValueFrom(
      this.http.post(`${catalogUrl}/products`, dto),
    );

    return response.data;
  }
}
