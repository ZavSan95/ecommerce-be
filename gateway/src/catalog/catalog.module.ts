import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { ProductsModule } from './products/products.module';

@Module({
  controllers: [],
  imports: [ProductsModule,]
})
export class CatalogModule {}
