import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsController } from './events/events.controller';

@Module({
  imports: [],
  controllers: [AppController, EventsController],
  providers: [],
})
export class AppModule {}
