import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryIdParamDto } from './dto/category-id.dto';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('categories')
@Public()
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService
  ) {}

  @Public()
  @Get()
  async getAll(@Query() pagination: PaginationDto){
    return this.categoriesService.getAll(pagination);
  }

  @Get(':id')
  async getById(@Param('id') id: string){
    return this.categoriesService.getById(id);
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

  @Patch(':id/status')
  toggleStatus(
    @Param('id') id: string
  ){
    return this.categoriesService.toggleStatus(id);
  }

  @Delete(':id')
  delete(@Param() params: CategoryIdParamDto) {
    return this.categoriesService.delete(params.id);
  }

}
