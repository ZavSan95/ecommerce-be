import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

import { FavoriteDto } from './dto/favorite.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getAuthenticatedUser } from '../auth/utils/get-authenticated-user';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  // ==========================
  // TOGGLE FAVORITE
  // ==========================
  async toggleFavorite(
    dto: FavoriteDto,
    req: Request,
    res: Response,
  ) {
    const user = await getAuthenticatedUser(
      req,
      res,
      this.natsClient,
    );

    return firstValueFrom(
      this.natsClient.send('favorites.toggle', {
        userId: user.id,
        productId: dto.productId,
        sku: dto.sku,
      }),
    );
  }

  // ==========================
  // GET ALL FAVORITES
  // ==========================
  async getAll(
    req: Request,
    res: Response,
    pagination: PaginationDto,
  ) {
    const user = await getAuthenticatedUser(
      req,
      res,
      this.natsClient,
    );

    return firstValueFrom(
      this.natsClient.send('favorites.getAll', {
        userId: user.id,
        pagination,
      }),
    );
  }
}
