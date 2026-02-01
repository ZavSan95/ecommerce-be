import { Body, Controller, Delete, Get, Post, Query, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoriteDto } from './dto/favorite.dto';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Request } from 'express';
import { AuthRequest } from '../common/interfaces/auth-request.interface';
import { firstValueFrom } from 'rxjs';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}


  @Post()
  async addFavorite(@Body() dto: FavoriteDto){
    return this.favoritesService.addFavorite(dto);
  }

  @Delete()
  async removeFavorite(@Body() id: string){
    return this.favoritesService.removeFavorite(id);
  }

  @Get()
  async getAll(
    @Req() req,
    @Query() pagination: PaginationDto,
  ) {

    console.log(req);
    console.log(pagination);
    const userId = req.user.userId;
    return this.favoritesService.getAll(userId, pagination);
  
  }

}
