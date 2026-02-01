import { Controller } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavoriteDto } from './dto/favorite.dto';
import { GetFavoritesDto } from './dto/get-favorites.dto';

@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @MessagePattern('favorites.add')
  async addFavorite(@Payload() payload: FavoriteDto){
    return this.favoritesService.addFavorite(payload);
  }

  @MessagePattern('favorites.remove')
  async removeFavorite(@Payload() payload: any){
    return this.favoritesService.removeFavorite(payload);
  }

  @MessagePattern('favorites.getAll')
  async getAll(@Payload() dto: GetFavoritesDto) {
    return this.favoritesService.getAll(
      dto.userId,
      dto.pagination,
    );
  }
}
