import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MercadoPagoService } from './mercadopago/mercadopago.service';

@Controller()
export class AppController {
  constructor(
    private readonly mpService: MercadoPagoService,
  ) {}

  @MessagePattern('payments.create')
  async handleCreatePayment(@Payload() payload: any) {
    console.log('📩 payments.create payload:', payload);

    const result = await this.mpService.createPreference({
      orderId: payload.orderId,
      amount: payload.amount,
      description: payload.description ?? 'Compra',
    });

    console.log('💳 MercadoPago result:', result);

    return result;
  }

  @MessagePattern('payments.verify')
  async verifyPayment(@Payload() data: { orderId: string }) {
    const payment = await this.mpService.findApprovedPaymentByOrder(data.orderId);

    if (!payment) {
      return {
        status: 'pending',
      };
    }

    return payment;
  }
}
