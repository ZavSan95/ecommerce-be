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
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { ValidateCheckoutDto } from './dto/validate-checkout.dto';
import { Category, CategoryDocument } from 'src/categories/schemas/category.schema';
import { CategoryStatus } from 'src/categories/enum/category-status.enum';
import { RpcException } from '@nestjs/microservices';
import { CatalogErrors } from 'src/common/errors/error-codes';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getAll() {
    const products = await this.productModel
      .find({ status: 'active' })
      .lean();

    return products;
  }

  async create(dto: CreateProductDto) {
    try {

      const category = await this.categoryModel.findById(dto.categoryId);

      if(!category){
        throw new RpcException({
          statusCode: 400,
          ...CatalogErrors.CATEGORY_NOT_FOUND,
        });
      }

      if(category.status !== CategoryStatus.ACTIVE){
        throw new RpcException({
          statusCode: 400,
          ...CatalogErrors.CATEGORY_INACTIVE,
        });
      }

      const skus = dto.variants.map( v => v.sku);

      const duplicateSkus = skus.filter(
        (sku, index) => skus.indexOf(sku) !== index,
      );

      if(duplicateSkus.length > 0){
        throw new RpcException({
          statusCode: 400,
          ...CatalogErrors.SKU_DUPLICATE
        });
      }

      const product = await this.productModel.create(dto);

      return product;

      
    } catch (error) {

      if (error instanceof RpcException) {
        throw error;
      }

      // 🔹 Si es error de Mongo u otro
      throw mapMongoError(error);
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
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw mapMongoError(error);
    }
  }


  async delete(id: string) {

    const product = await this.productModel.findById(id);

    if(!product){
      throw new RpcException({
        statusCode: 400,
        ...CatalogErrors.PRODUCT_NOT_FOUND,
      });
    }
    await product.deleteOne();

    return {
      message: 'Producto eliminado correctamente',
      id,
    };
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
