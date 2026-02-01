import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { NatsModule } from 'src/nats/nats.module';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';

@Module({
  imports: [MongooseModule.forFeature([
    {name: Favorite.name, schema: FavoriteSchema},
    {name: Product.name, schema: ProductSchema},
  ]), NatsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
