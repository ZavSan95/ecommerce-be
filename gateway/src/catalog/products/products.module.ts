import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';

@Module({
  imports: [HttpModule],
  controllers: [ProductsController],
})
export class ProductsModule implements OnModuleInit {
  private readonly logger = new Logger(ProductsModule.name);

  onModuleInit() {
    this.logger.log('ProductsModule loaded');
  }
}