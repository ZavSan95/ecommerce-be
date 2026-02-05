import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoriteDto } from './dto/favorite.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Request, Response } from 'express';

@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
  ) {}

  // ==========================
  // TOGGLE FAVORITE
  // ==========================
  @Post('toggle')
  async toggleFavorite(
    @Body() dto: FavoriteDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.favoritesService.toggleFavorite(
      dto,
      req,
      res,
    );
  }

  // ==========================
  // GET MY FAVORITES
  // ==========================
  @Get()
  async getAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() pagination: PaginationDto,
  ) {
    return this.favoritesService.getAll(
      req,
      res,
      pagination,
    );
  }
}
