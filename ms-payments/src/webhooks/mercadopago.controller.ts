import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MercadoPagoService } from 'src/mercadopago/mercadopago.service';

@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(
    private readonly mpService: MercadoPagoService,
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  async handleWebhook(@Body() body: any) {
    console.log('🔔 MP Webhook recibido:', body);

    try {
      // Solo pagos
      if (body?.type !== 'payment') {
        return { ok: true };
      }

      const paymentId = body?.data?.id;

      if (!paymentId || !/^\d+$/.test(String(paymentId))) {
        console.warn('⚠️ Payment ID inválido:', paymentId);
        return { ok: true };
      }

      const payment = await this.mpService.getPayment(paymentId);

      console.log('💳 Estado MP:', payment.status);

      if (payment.status === 'approved') {
        // Evento NEUTRO (no de dominio)
        this.natsClient.emit('payments.confirmed', {
          provider: 'mercadopago',
          providerPaymentId: payment.id,
          orderId: payment.external_reference,
          amount: payment.transaction_amount,
        });
      }
    } catch (error: any) {
      // Nunca romper webhook
      console.warn(
        '⚠️ Error procesando webhook MP:',
        error?.message ?? error,
      );
    }

    return { ok: true };
  }
}
