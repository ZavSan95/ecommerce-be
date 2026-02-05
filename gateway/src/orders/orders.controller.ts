import {
  Controller,
  Inject,
  Post,
  Get,
  Query,
  BadRequestException,
  Body,
  Req,
  Param,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getAuthenticatedUser } from '../auth/utils/get-authenticated-user';
import { Request, Response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Post('checkout')
  async checkout(@Body() dto: Omit<CreateOrderDto, 'customerId' | 'customerEmail' | 'customerName'>, @Req() req: any) {
    const user = req.user; // { id, email, ... }

    const payload: CreateOrderDto = {
      ...dto,
      customerId: user.userId,
      customerEmail: user.email,
      customerName: user.email, // o user.name si lo tenés
    };

    console.log(user);
    console.log(payload);

    return firstValueFrom(
      this.natsClient
        .send('orders.checkout.create', payload)
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

  // ==========================
  //  My Orders
  // ==========================
  @Get('my')
  async getMyOrders(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await getAuthenticatedUser(
      req,
      res,
      this.natsClient,
    );

    return firstValueFrom(
      this.natsClient.send('orders.my', {
        userId: user.id,
      }),
    );
  }

  // ==========================
  //  Orders by ID
  // ==========================

  @Get('order/:id')
  async getOrderById(
    @Param('id') orderId: string,
    @Req() req: any
  ){
    const userId = req.user.id;

    return this.natsClient.send('orders.order',{
      userId,
      orderId
    });
  }

  @Public()
  @Get()
  async getAll(@Query() pagination: PaginationDto){
    return firstValueFrom(
      this.natsClient.send('orders.all', pagination)
    );
  }

}
