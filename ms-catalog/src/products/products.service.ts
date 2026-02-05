import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { mapMongoError } from 'src/common/errors/mongo-error.mapper';
import { ValidateCheckoutDto } from './dto/validate-checkout.dto';
import { Category, CategoryDocument } from 'src/categories/schemas/category.schema';
import { CategoryStatus } from 'src/categories/enum/category-status.enum';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CategoryErrors, ProductErrors } from 'src/common/errors/error-codes';
import { Favorite, FavoriteDocument } from 'src/favorites/schemas/favorite.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>
  ) {}


  async getAll({
    page = 1,
    limit = 20,
    sort,
    search
  }: PaginationDto) {

    /* =============================
    * 1️⃣ Query base
    * ============================= */
    const query: any = {
      status: 'active',
    };

    /* =============================
    * 2️⃣ Search (nombre + SKU)
    * ============================= */
    if (search) {
      const regex = new RegExp(search, 'i');

      query.$or = [
        { name: regex },
        { 'variants.sku': regex },
      ];
    }


    /* =============================
    * 4️⃣ Sort
    * ============================= */
    const sortOptions: Record<string, 1 | -1> = {};

    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      // default sort (muy importante en ecommerce)
      sortOptions.createdAt = -1;
    }

    /* =============================
    * 5️⃣ Paginación
    * ============================= */
    const skip = (page - 1) * limit;

    /* =============================
    * 6️⃣ Queries en paralelo
    * ============================= */
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('categoryId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

      this.productModel.countDocuments(query),
    ]);

    /* =============================
    * 7️⃣ Response estándar
    * ============================= */
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


  async getBySlugCategory(slug: string) {

    const category = await this.categoryModel
      .findOne({ status: 'active', slug })
      .lean();

    if (!category) {
      throw new RpcException({
        statusCode: 404,
        ...CategoryErrors.CATEGORY_NOT_FOUND,
      });
    }

    const products = await this.productModel
      .find({
        status: 'active',
        categoryId: category._id.toString(),
      })
      .lean();

    return products;
  }


  async getBySlugProduct(slug: string) {

    const product = await this.productModel
      .findOne({
        status: 'active',
        'variants.sku': slug,
      })
      .lean();

    const variant = product?.variants.find(v => v.sku === slug);

    return {
      ...product,
      variants: [variant],
    };

  }

  async getById(id: string) {
    const product = await this.productModel
      .findById(id)
      .lean();

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    return {
      ...product,
      variants: product.variants ?? [],
    };
  }

  async getProductsRelated(slug: string){
    
    const product = await this.productModel.findOne({
      status: 'active',
      'variants.sku': slug,
    }).lean();

    if(!product) return null;

    const currentVariant = product.variants.find( v => v.sku === slug);

    if(product.variants.length > 1){
      return {
        ...product,
        variants: product.variants,
        relatedType: 'variants',
        related: [],
      };
    }

    const relatedProducts = await this.productModel.find({
      status: 'active',
      categoryId: product.categoryId,
      _id: { $ne: product._id },
    })
    .limit(4)
    .lean();

    return {
      ...product,
      variants: [currentVariant],
      relatedType: 'products',
      related: relatedProducts,
    };
  }

  async search(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const regex = new RegExp(query, 'i');

    return this.productModel
      .find({
        status: 'active',
        $or: [
          { name: regex },
          { description: regex },
        ],
      })
      .limit(8)
      .lean();
  }


  async create(dto: CreateProductDto) {
    try {

      const category = await this.categoryModel.findById(dto.categoryId);

      if(!category){
        throw new RpcException({
          statusCode: 400,
          ...CategoryErrors.CATEGORY_NOT_FOUND,
        });
      }

      if(category.status !== CategoryStatus.ACTIVE){
        throw new RpcException({
          statusCode: 400,
          ...CategoryErrors.CATEGORY_INACTIVE,
        });
      }

      const skus = dto.variants.map( v => v.sku);

      const duplicateSkus = skus.filter(
        (sku, index) => skus.indexOf(sku) !== index,
      );

      if(duplicateSkus.length > 0){
        throw new RpcException({
          statusCode: 400,
          ...ProductErrors.SKU_DUPLICATE
        });
      }

      const product = await this.productModel.create({
        ...dto,
        variants: dto.variants.map(v => ({
          ...v,
          images: v.images ?? [],
        })),
      });

      return product;

      
    }catch (error) {

      if (error instanceof RpcException) {
        throw error;
      }

      throw mapMongoError(error, ProductErrors.PRODUCT_CREATE_FAILED);
    }

  }

  async findAll() {
    return this.productModel.find().exec();
  }


  async update(productId: string, dto: UpdateProductDto) {

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    /* =============================
      1. Campos simples
    ============================= */
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.status !== undefined) product.status = dto.status;

    /* =============================
      2. Actualizar variantes
    ============================= */
    if (dto.variantsToUpdate?.length) {
      for (const update of dto.variantsToUpdate) {
        const variant = product.variants.find(v => v.sku === update.sku);

        if (!variant) {
          throw new RpcException({
            statusCode: 400,
            message: `Variante con sku ${update.sku} no existe`,
          });
        }

        if (update.price !== undefined) variant.price = update.price;
        if (update.stock !== undefined) variant.stock = update.stock;
        if (update.attributes !== undefined)
          variant.attributes = update.attributes;
        if (update.images !== undefined) variant.images = update.images;
        if (update.isDefault !== undefined)
          variant.isDefault = update.isDefault;
      }
    }

    /* =============================
      3. Agregar nuevas variantes
    ============================= */
    if (dto.variantsToAdd?.length) {

      const skus = dto.variantsToAdd.map(v => v.sku);
      const duplicated = skus.filter(
        (sku, index) => skus.indexOf(sku) !== index,
      );

      if (duplicated.length) {
        throw new RpcException({
          statusCode: 400,
          message: `SKU duplicado en la solicitud: ${duplicated.join(', ')}`,
        });
      }

      for (const newVariant of dto.variantsToAdd) {
        const existingIndex = product.variants.findIndex(
          v => v.sku === newVariant.sku,
        );

        if (existingIndex >= 0) {
          product.variants[existingIndex] = {
            ...product.variants[existingIndex],
            ...newVariant,
          };
        } else {
          product.variants.push(newVariant as any);
        }
      }
    }

    /* =============================
      4. Reglas de negocio
    ============================= */
    if (!product.variants.length) {
      throw new RpcException({
        statusCode: 400,
        message: 'El producto debe tener al menos una variante',
      });
    }

    const defaults = product.variants.filter(v => v.isDefault);
    if (defaults.length > 1) {
      product.variants.forEach(v => (v.isDefault = false));
      defaults.at(-1)!.isDefault = true;
    }

    /* =============================
      5. Guardar
    ============================= */
    try {
      return await product.save();
    }catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw mapMongoError(error, ProductErrors.PRODUCT_UPDATE_FAILED);
    }
  }


  async delete(id: string) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();

    try {
      const product = await this.productModel
        .findById(id)
        .session(session);

      if (!product) {
        throw new RpcException({
          statusCode: 400,
          ...ProductErrors.PRODUCT_NOT_FOUND,
        });
      }

      await this.favoriteModel.deleteMany(
        { productId: id },
        { session }
      );

      await product.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        message: 'Producto eliminado correctamente',
        id,
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async validateForCheckout(dto: ValidateCheckoutDto){

    type CheckoutValidationItem = {
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      availableStock: number;
    };

    const result: CheckoutValidationItem[] = [];

    for (const item of dto.items){
      const product = await this.productModel.findById(item.productId);

      if(!product || product.status !== 'active'){
        throw new NotFoundException('Producto no disponible');
      }

      const variant = await product.variants.find(v => v.sku === item.sku);

      if(!variant){
        throw new NotFoundException('Variante no disponible');
      }

      if(variant.stock <= 0 ){
        throw new BadRequestException('Sin Stock');
      }

      if (item.quantity > variant.stock) {
        throw new BadRequestException('Stock insuficiente');
      }

      result.push({
        productId: product.id,
        productName: product.name,
        sku: variant.sku,
        unitPrice: variant.price,
        availableStock: variant.stock,
      });

    }

    return { items: result };
  }

}
