  import { Inject, Injectable } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  import { CreateCategoryDto } from './dto/create-category.dto';
  import { UpdateCategoryDto } from './dto/update-category.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from '../common/dto/pagination.dto';


  @Injectable()
  export class CategoriesService {
    constructor(
      @Inject('NATS_CLIENT')
      private readonly natsClient: ClientProxy,
    ) {}

    async getAll(pagination: PaginationDto){
      return await firstValueFrom(
        this.natsClient.send('categories.getAll', pagination).pipe(
          catchError((error) => {
            throw error;
          }),
        ),
      );
    }

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
