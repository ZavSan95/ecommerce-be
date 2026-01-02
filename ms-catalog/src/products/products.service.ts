import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { mapMongoError } from 'src/common/errors/mongo-error.mapper';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    try {
      return await this.productModel.create(dto);
    } catch (error) {
      throw mapMongoError(error);
    }
  }

  async findAll() {
    return this.productModel.find().exec();
  }

  async update(productId: string, dto: UpdateProductDto) {

      console.log('DTO RECIBIDO:', dto);
      
      const product = await this.productModel.findById(productId);

      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }

      /* =====================================================
        1. Actualizar campos simples del producto
      ===================================================== */
      if (dto.name !== undefined) product.name = dto.name;
      if (dto.description !== undefined) product.description = dto.description;
      if (dto.category !== undefined) product.category = dto.category;
      if (dto.status !== undefined) product.status = dto.status;

      /* =====================================================
        2. Actualizar variantes existentes (por sku)
      ===================================================== */
      if (dto.variantsToUpdate?.length) {
        for (const update of dto.variantsToUpdate) {
          const variant = product.variants.find(v => v.sku === update.sku);

          if (!variant) {
            throw new BadRequestException(
              `Variant con sku ${update.sku} no existe`,
            );
          }

          if (update.price !== undefined) variant.price = update.price;
          if (update.stock !== undefined) variant.stock = update.stock;
          if (update.attributes !== undefined) variant.attributes = update.attributes;
          if (update.images !== undefined) variant.images = update.images;
          if (update.isDefault !== undefined) variant.isDefault = update.isDefault;
        }
      }

      /* =====================================================
        3. Agregar nuevas variantes
      ===================================================== */
      if (dto.variantsToAdd?.length) {
        for (const newVariant of dto.variantsToAdd) {
          product.variants.push(newVariant as any);
        }
      }

      /* =====================================================
        4. Reglas de negocio
      ===================================================== */

      // Al menos una variante
      if (!product.variants.length) {
        throw new BadRequestException('El producto debe tener al menos una variante');
      }

      // Solo una variante por defecto
      const defaults = product.variants.filter(v => v.isDefault);
      if (defaults.length > 1) {
        // dejamos solo la última marcada como default
        product.variants.forEach(v => (v.isDefault = false));
        defaults[defaults.length - 1].isDefault = true;
      }

      /* =====================================================
        5. Guardar
      ===================================================== */
      try {
        return await product.save();
      } catch (error) {
        mapMongoError(error);
      }
    }
}
