import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryIdParamDto } from './dto/category-id.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('categories')
@Public()
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService
  ) {}

  // @Public()
  @Get()
  async getAll(){
    return this.categoriesService.getAll();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateCategoryDto,
  ){
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param() params: CategoryIdParamDto) {
    return this.categoriesService.delete(params.id);
  }

}
