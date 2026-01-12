import { Logger, Module, OnModuleInit } from '@nestjs/common';

import { ProductsController } from './products.controller';
import { NatsModule } from '../nats/nats.module';
import { ProductService } from './products.service';

@Module({
  imports: [NatsModule],
  controllers: [ProductsController],
  providers: [ProductService]
})
export class ProductsModule implements OnModuleInit {
  private readonly logger = new Logger(ProductsModule.name);

  onModuleInit() {
    this.logger.log('ProductsModule loaded');
  }
}