import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Model } from 'mongoose';
import { mapMongoError } from 'src/common/errors/mongo-error.mapper';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RpcException } from '@nestjs/microservices';
import { toSlug } from 'src/common/utils/slug.util';


@Injectable()
export class CategoriesService {
    
  constructor(
      @InjectModel(Category.name)
      private readonly categoryModel: Model<CategoryDocument>,

      @InjectModel(Product.name)
      private readonly productModel: Model<ProductDocument>,

  ){}

  async getAll(){
    const categories = await this.categoryModel
      .find({status: 'active'})
      .lean();

    return categories;
  }


  async create(dto: CreateCategoryDto) {
    try {
      let slug = toSlug(dto.name);

      const exists = await this.categoryModel.findOne({ slug });
      if (exists) {
        slug = `${slug}-${Date.now()}`;
      }

      return await this.categoryModel.create({
        ...dto,
        slug,
      });

    } catch (error) {
      throw mapMongoError(error);
    }
  }


  async update(id: string, dto: UpdateCategoryDto) {


      const category = await this.categoryModel.findById(id);

      if (!category) {
      throw new RpcException({
          statusCode: 404,
          message: 'Categoría no encontrada',
      });
      }

      try {
      Object.assign(category, dto);
      await category.save();

      return {
          id: category.id,
          name: category.name,
          description: category.description,
      };
      } catch (error) {
      // Mongo duplicate key
      if (error.code === 11000) {
          throw new RpcException({
          statusCode: 409,
          message: 'Ya existe una categoría con ese nombre',
          });
      }

      throw new RpcException({
          statusCode: 500,
          message: 'Error al actualizar la categoría',
      });
      }
  }


  async delete(id: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }

      const productsCount = await this.productModel.countDocuments({
        categoryId: category._id,
      });

      if (productsCount > 0) {
        throw new BadRequestException(
          'No se puede eliminar la categoría porque tiene productos asociados',
        );
      }

      await category.deleteOne();

      return {
        message: 'Categoría eliminada correctamente',
        id,
      };
    } catch (error) {
      throw mapMongoError(error);
    }
  }


}
