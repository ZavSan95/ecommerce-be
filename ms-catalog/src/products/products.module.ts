import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({

  imports: [MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema}
  ])],
  controllers: [ProductsController],
  providers: [ProductsService],
})

export class ProductsModule implements OnModuleInit {
  private readonly logger = new Logger(ProductsModule.name);

  onModuleInit() {
    this.logger.log('ProductsModule loaded');
  }
}
