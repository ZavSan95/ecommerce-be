import { Body, Controller, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  CreateProductDto,
  GetProductResponse,
} from '@ecommerce/contracts';
import { firstValueFrom } from 'rxjs';

@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly http: HttpService) {}

  @Post()
  async create(
    @Body() dto: CreateProductDto,
  ): Promise<GetProductResponse> {
    const catalogUrl = process.env.CATALOG_URL || 'http://localhost:3001';

    const response = await firstValueFrom(
      this.http.post<GetProductResponse>(
        `${catalogUrl}/products`,
        dto,
      ),
    );

    return response.data;
  }
}
