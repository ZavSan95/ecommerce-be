  import { Inject, Injectable } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  import { CreateCategoryDto } from './dto/create-category.dto';
  import { UpdateCategoryDto } from './dto/update-category.dto';


  @Injectable()
  export class CategoriesService {
    constructor(
      @Inject('NATS_CLIENT')
      private readonly natsClient: ClientProxy,
    ) {}

    async create(dto: CreateCategoryDto) {
      
      return this.natsClient.send(
        'categories.create',
        dto,
      );

    }

    async update(id: string, dto: UpdateCategoryDto){
      return this.natsClient.send(
        'categories.update', {
          id,
          data: dto,
        }
      );
    }

    async delete(id: string){
      return this.natsClient.send(
        'categories.delete', {
          id,
        }
      );
    }

  }
