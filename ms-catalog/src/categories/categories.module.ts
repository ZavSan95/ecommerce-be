import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { NatsModule } from 'src/nats/nats.module';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Category.name, schema: CategorySchema},
    { name: Product.name, schema: ProductSchema},
  ]), NatsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
