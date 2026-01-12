import { Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCategoryDto } from './dto/create-category-dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryPayloadDto } from './dto/payload-category.dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern('categories.create')
  create(@Payload() dto: CreateCategoryDto){
    return this.categoriesService.create(dto);
  }

  @MessagePattern('categories.update')
  update(@Payload() payload: UpdateCategoryPayloadDto) {
    return this.categoriesService.update(payload.id, payload.data);
  }

  @MessagePattern('categories.delete')
  delete(@Payload('id') id: string) {
    return this.categoriesService.delete(id);
  }


}
