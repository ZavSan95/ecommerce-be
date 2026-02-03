import { Controller } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetFavoritesDto } from './dto/get-favorites.dto';
import type { FavoriteAddPayload } from './interfaces/add-favorite.interface';
import type { FavoriteRemovePayload } from './interfaces/remove-favorite.interface';

@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @MessagePattern('favorites.toggle')
  async toggleFavorite(@Payload() payload: FavoriteAddPayload) {
    return this.favoritesService.toggleFavorite(payload);
  }

  @MessagePattern('favorites.getAll')
  async getAll(@Payload() dto: GetFavoritesDto) {
    return this.favoritesService.getAll(
      dto.userId,
      dto.pagination,
    );
  }
}
