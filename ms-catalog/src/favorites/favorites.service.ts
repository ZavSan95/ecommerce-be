import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { mapMongoError } from 'src/common/errors/mongo-error.mapper';
import { FavoriteErrors } from 'src/common/errors/error-codes';
import { FavoriteAddPayload } from './interfaces/add-favorite.interface';
import { FavoriteRemovePayload } from './interfaces/remove-favorite.interface';

/* ======================================================
   🔹 Tipos de lectura (NO mongoose documents)
====================================================== */

type LeanProduct = Omit<Product, 'categoryId'> & {
  _id: string;
  categoryId?: {
    _id: string;
    name: string;
  };
};

type FavoritesResponseItem = {
  id: string;
  productId: string;
  sku: string;
  product: {
    name?: string;
    image?: string;
    category?: string;
  };
};

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  /* ======================================================
     📌 GET ALL FAVORITES (con datos para el front)
  ====================================================== */
  async getAll(
    userId: string,
    pagination: PaginationDto = {},
  ) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    /* =============================
       1️⃣ Favorites
    ============================== */
    const [favorites, total] = await Promise.all([
      this.favoriteModel
        .find({ userId })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.favoriteModel.countDocuments({ userId }),
    ]);

    if (favorites.length === 0) {
      return {
        data: [],
        meta: {
          totalItems: total,
          itemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    /* =============================
       2️⃣ Products asociados
    ============================== */
    const productIds = favorites.map(f => f.productId);

    const rawProducts = await this.productModel
      .find({ _id: { $in: productIds } })
      .populate('categoryId', 'name')
      .lean();

    /* =============================
       3️⃣ Normalización (boundary)
    ============================== */
    const products: LeanProduct[] = rawProducts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      categoryId: p.categoryId
        ? {
            _id: p.categoryId._id.toString(),
            name: p.categoryId.name,
          }
        : undefined,
    }));

    const productsMap = new Map<string, LeanProduct>(
      products.map(p => [p._id, p]),
    );

    /* =============================
       4️⃣ Response para frontend
    ============================== */
    const data: FavoritesResponseItem[] = favorites.map(fav => {
      const product = productsMap.get(fav.productId.toString());
      const variant = product?.variants?.find(v => v.sku === fav.sku);

      return {
        id: fav._id.toString(),
        productId: fav.productId.toString(),
        sku: fav.sku,

        product: {
          name: product?.name,
          image: variant?.images?.[0],
          category: product?.categoryId?.name,
        },
      };
    });

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

  async toggleFavorite({ userId, productId, sku }: FavoriteAddPayload) {

    // 1️⃣ Validaciones
    const user = await firstValueFrom(
      this.natsClient.send('user.verify', userId),
    );

    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: 'Usuario no encontrado',
      });
    }

    const product = await this.productModel.findOne({
      _id: productId,
      'variants.sku': sku,
    });

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: 'Producto o variante no encontrada',
      });
    }

    // 2️⃣ Buscar favorito existente
    const existing = await this.favoriteModel.findOne({
      userId,
      productId,
      sku,
    });

    // 3️⃣ SI EXISTE → ELIMINAR
    if (existing) {
      await existing.deleteOne();

      return {
        isFavorite: false,
        favoriteId: null,
      };
    }

    // 4️⃣ SI NO EXISTE → CREAR
    const created = await this.favoriteModel.create({
      userId,
      productId,
      sku,
    });

    return {
      isFavorite: true,
      favoriteId: created._id.toString(),
    };
  }



}
