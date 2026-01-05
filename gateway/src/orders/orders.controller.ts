import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateOrderDto) {
    return firstValueFrom(
      this.natsClient
        .send('orders.checkout.create', dto)
        .pipe(timeout(5000)),
    );
  }
}
