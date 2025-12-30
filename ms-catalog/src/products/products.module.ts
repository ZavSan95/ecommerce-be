import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})

export class ProductsModule implements OnModuleInit {
  private readonly logger = new Logger(ProductsModule.name);

  onModuleInit() {
    this.logger.log('ProductsModule loaded');
  }
}
