import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsController } from './events/events.controller';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [AppController, EventsController],
  providers: [],
})
export class AppModule {}
