import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NatsModule } from '../nats/nats.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsModule, DatabaseModule]
})
export class OrdersModule {}
