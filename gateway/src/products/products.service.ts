import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class ProductService {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  async create(dto: CreateProductDto) {
    return await firstValueFrom(
      this.natsClient.send('products.create', dto),
    );
  }

  async patch(id: string, dto: UpdateProductDto){

    const payload = { id, dto };
    return this.natsClient.send(
      'products.update',
      {
        id,
        data: dto, 
      },
    );
  }

  async delete(params: ProductIdParamDto){
    return this.natsClient.send(
        'products.delete',
        params
    );
  }
}
