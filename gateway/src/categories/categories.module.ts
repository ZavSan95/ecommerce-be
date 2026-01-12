import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { NatsModule } from '../nats/nats.module';
import { CategoriesService } from './categories.service';

@Module({
  imports: [NatsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
