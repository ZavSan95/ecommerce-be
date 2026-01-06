import {
  Controller,
  Inject,
  Post,
  Get,
  Query,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  // ==========================
  // 1️⃣ Checkout
  // ==========================
  @Post('checkout')
  async checkout(@Body() dto: CreateOrderDto) {
    return firstValueFrom(
      this.natsClient
        .send('orders.checkout.create', dto)
        .pipe(timeout(5000)),
    );
  }

  // ==========================
  // 2️⃣ Success redirect
  // ==========================
  @Get('checkout/success')
  async checkoutSuccess(@Query('orderId') orderId: string) {
    if (!orderId) {
      throw new BadRequestException('orderId requerido');
    }

    // 🔍 Verificar pago
    const verification = await firstValueFrom(
      this.natsClient.send('payments.verify', { orderId }).pipe(timeout(5000)),
    );

    if (verification.status !== 'paid') {
      return {
        status: 'pending',
        message: 'Pago aún no confirmado',
      };
    }

    // 🔔 EMITIR EVENTO COMPLETO (FIX)
    this.natsClient.emit('payments.confirmed', {
      provider: 'mercadopago',
      orderId, // ✅ CLAVE
      providerPaymentId: verification.providerPaymentId,
      amount: verification.amount,
    });

    return {
      status: 'paid',
      message: 'Pago confirmado correctamente',
      orderId,
    };
  }


  // ==========================
  // 3️⃣ Failure
  // ==========================
  @Get('checkout/failure')
  async checkoutFailure(@Query('orderId') orderId: string) {
    return {
      status: 'failed',
      orderId,
      message: 'El pago fue rechazado',
    };
  }

  // ==========================
  // 4️⃣ Pending
  // ==========================
  @Get('checkout/pending')
  async checkoutPending(@Query('orderId') orderId: string) {
    return {
      status: 'pending',
      orderId,
      message: 'Pago pendiente de confirmación',
    };
  }
}
