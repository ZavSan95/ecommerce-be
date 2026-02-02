import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoriteDto } from './dto/favorite.dto';
import { PaginationDto } from '../common/dto/pagination.dto';


@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  async toggleFavorite(
    @Body() dto: FavoriteDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.favoritesService.toggleFavorite(dto, userId);
  }

  @Get()
  async getAll(
    @Req() req,
    @Query() pagination: PaginationDto,
  ) {

    const userId = req.user.userId;
    return this.favoritesService.getAll(userId, pagination);
  
  }

}
