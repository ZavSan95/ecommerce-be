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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CategoryStatus } from './enum/category-status.enum';
import { CategoryErrors } from 'src/common/errors/error-codes';


@Injectable()
export class CategoriesService {
    
  constructor(
      @InjectModel(Category.name)
      private readonly categoryModel: Model<CategoryDocument>,

      @InjectModel(Product.name)
      private readonly productModel: Model<ProductDocument>,

  ){}

  async getAll({ page = 1, limit = 20, sort, search }: PaginationDto){

    const query: any = { status: 'active' };

    if(search){
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    
    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.categoryModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };


  }

  async getById(id: string) {
    try {
      const category = await this.categoryModel
        .findById(id)
        .lean();

      if (!category) {
        throw new RpcException({
            statusCode: 404,
            message: 'Categoría no encontrada',
        });
      }

      return category;

    } catch (error) {
      throw new RpcException({
          statusCode: 404,
          message: 'Error al obtener categoría',
      });
    }
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

      }catch (error) {
        throw mapMongoError(error, CategoryErrors.CATEGORY_CREATE_FAILED);
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

      if (dto.name && dto.name !== category.name) {

        let slug = toSlug(dto.name);

        // Buscar si existe otro con ese slug (excluyendo el actual)
        const exists = await this.categoryModel.findOne({
          slug,
          _id: { $ne: id },
        });

        if (exists) {
          slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        category.slug = slug;
        category.name = dto.name;
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
        throw new RpcException({
          statusCode: 404,
          message: 'Categoría no encontrada',
        });
      }

      const productsCount = await this.productModel.countDocuments({
        categoryId: id,
      });

      if (productsCount > 0) {
        throw new RpcException({
          statusCode: 400,
          message:
            'No se puede eliminar la categoría porque tiene productos asociados',
        });
      }



      await category.deleteOne();

      return {
        message: 'Categoría eliminada correctamente',
        id,
      };
    }catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw mapMongoError(error, CategoryErrors.CATEGORY_DELETE_FAILED);
    }
  }

  async toggleStatus(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new RpcException({
        statusCode: 404,
        message: 'Categoría no encontrada',
      });
    }

    category.status =
      category.status === CategoryStatus.ACTIVE
        ? CategoryStatus.INACTIVE
        : CategoryStatus.ACTIVE;

    await category.save();

    return {
      id: category.id,
      status: category.status,
    };
  }




}
