import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentProvider } from '@prisma/client';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('orders.checkout.create')
  createOrder(@Payload() dto: CreateOrderDto) {
    console.log('DTO OK:', dto);
    return this.ordersService.createOrder(dto); 
  }

  @EventPattern('payments.confirmed')
  async handlePaymentConfirmed(
    @Payload()
    payload: {
      provider: PaymentProvider;
      providerPaymentId: string;
      orderId: string;
      amount: number;
    },
  ) {
    console.log('📥 Evento payments.confirmed recibido:', payload);

    await this.ordersService.confirmPayment(payload);
  }

  @MessagePattern('orders.my')
  async getMyOrders(@Payload() data: { userId: string }){
    return this.ordersService.getMyOrders(data.userId);
  }

  @MessagePattern('orders.order')
  async getOrderById(@Payload() data: { userId: string, orderId: string }){
    return this.ordersService.getOrderById(data);
  }
  
}
