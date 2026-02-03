import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  async getAll(pagination: PaginationDto) {
    return firstValueFrom(
      this.natsClient.send('products.getAll', pagination).pipe(
        catchError(error => {
          throw error;
        }),
      ),
    );
  }

  async getByCategorySlug(id: string) {
    return firstValueFrom(
      this.natsClient.send('products.get.slug', id).pipe(
        catchError(error => {
          throw error;
        }),
      ),
    );
  }

  async getByProductSlug(id: string) {
    return firstValueFrom(
      this.natsClient.send('products.get.slug.product', id).pipe(
        catchError(error => {
          throw error;
        }),
      ),
    );
  }

  async getById(id: string){
    return firstValueFrom(
      this.natsClient.send('product.get.id', id).pipe(
        catchError((error) => {
          throw error;
        }),
      ),
    );
  }

  async create(dto: CreateProductDto) {
    return firstValueFrom(
      this.natsClient.send('products.create', dto).pipe(
        catchError(error => {
          throw error;
        }),
      ),
    );
  }

  async patch(id: string, dto: UpdateProductDto) {
    return firstValueFrom(
      this.natsClient.send('products.update', {
        id,
        data: dto,
      }).pipe(
        catchError(error => {
          throw error;
        }),
      ),
    );
  }

  async delete(params: ProductIdParamDto) {
    return firstValueFrom(
      this.natsClient.send('products.delete', params).pipe(
        catchError(error => {
          throw error;
        }),
      ),
    );
  }
}
