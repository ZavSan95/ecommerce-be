import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { timeout, firstValueFrom } from 'rxjs';
import { CheckoutValidatedItem, CheckoutValidationResponse } from './types/products.types';
import { OrderItemInput } from './types/order-item.type';
import { PrismaService } from '../database/prisma.service';
import { PaymentProvider } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,

        @Inject('NATS_CLIENT')
        private readonly natsClient: ClientProxy,
    ) {}

    async validateProducts(
    items: CreateOrderDto['items'],
    ): Promise<CheckoutValidationResponse> {
        try {
            const response = await firstValueFrom(
            this.natsClient
                .send<CheckoutValidationResponse>(
                'products.checkout.validate',
                { items },
                )
                .pipe(timeout(3000)),
            );

            return response;
        } catch {
            throw new RpcException({
                statusCode: 400,
                message: 'No se pudo validar el carrito',
            });
        }
    }

    async createOrder(dto: CreateOrderDto): Promise<CheckoutResponseDto>{

        console.log('🟢 createOrder DTO:', dto);

        const validation: CheckoutValidationResponse =
            await this.validateProducts(dto.items);

        console.log('🟢 Validation:', validation);

        if(!validation?.items || validation.items.length === 0){
            throw new BadRequestException('Carrito inválido');
        }

        let subtotal = 0;

        
        // =====================================================
        // 1. Mapear items
        // =====================================================

        const orderItems: OrderItemInput[] = validation.items.map(
            (validatedItem: CheckoutValidatedItem) => {
                const requestedItem = dto.items.find(
                    (i) => i.sku === validatedItem.sku
                );

                if (!requestedItem) {
                    throw new BadRequestException('Item inválido en el carrito');
                }

                const totalPrice = validatedItem.unitPrice * requestedItem.quantity;

                subtotal += totalPrice;

                return {
                    productId: validatedItem.productId,
                    productName: validatedItem.productName,
                    sku: validatedItem.sku,
                    quantity: requestedItem.quantity,
                    unitPrice: validatedItem.unitPrice,
                    totalPrice,
                };
            }
        )

        // =====================================================
        // 2. Totales
        // =====================================================

        const discount = 0;
        const tax = 0;
        const shipping = 0;
        const total = subtotal + discount + tax + shipping;

        // =====================================================
        // 3. Persistencia con Prisma
        // =====================================================

        console.log('🟢 OrderItems:', orderItems);

        const order = await this.prisma.order.create({
            data: {
            orderNumber: `ORD-${Date.now()}`,
            status: 'pending_payment',
            currency: 'ARS',

            subtotalAmount: subtotal,
            discountAmount: discount,
            taxAmount: tax,
            shippingAmount: shipping,
            totalAmount: total,

            customerId: dto.customerId ?? null,
            customerEmail: dto.customerEmail,
            customerName: dto.customerName,

            items: {
                create: orderItems,
            },

            addresses: {
                create: [
                {
                    type: 'billing',
                    ...dto.billingAddress,
                },
                {
                    type: 'shipping',
                    ...dto.shippingAddress,
                },
                ],
            },

            payments: {
                create: {
                provider: dto.paymentProvider,
                status: 'pending',
                amount: total,
                },
            },
            },

              include: {
                    payments: true, 
                },
        });

        console.log('🟢 Order creada:', order.id);
        // =====================================================
        // 4. Llamado a Payments-ms
        // =====================================================
        const payment = order.payments[0];

        let paymentInit;

        console.log('🟢 Enviando a payments:', {
            orderId: order.id,
            provider: dto.paymentProvider,
        });
        
        try {

            paymentInit = await firstValueFrom(
                this.natsClient.send('payments.create', {
                    orderId: order.id,
                    paymentId: payment.id,
                    method: dto.paymentProvider,
                    amount: total,
                    currency: 'ARS',
                    customer: {
                        email: order.customerEmail,
                        name: order.customerName,
                    },
                }),
            );

            console.log('📦 Respuesta de payments:', paymentInit);

            if (!paymentInit?.providerPaymentId || !paymentInit?.checkoutUrl) {
                throw new Error('Respuesta inválida de la pasarela de pago');
            }

            await this.prisma.orderPayment.update({
                where: { id: payment.id },
                data: {
                    providerPaymentId: paymentInit.providerPaymentId,
                    payload: paymentInit,
                    status: 'pending',
                },
            });
            
        } catch (error) {
            
            console.log('❌ Error en pasarela de pago:', error);

            await this.prisma.orderPayment.update({
                where: { id: payment.id },
                data: {
                    status: 'failed',
                    payload: {
                        error: error?.message ?? 'Error desconocido en pasarela',
                    },
                },
            });

            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'cancelled',
                },
            });

            throw new BadRequestException('No se pudo inicializar el pago. Intente nuevamente.',)
        }

        return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        currency: order.currency,

        totals: {
            subtotal,
            discount,
            tax,
            shipping,
            total,
        },

        payment: {
            provider: payment.provider,
            status: payment.status,
            amount: payment.amount.toNumber(),
            checkoutUrl: paymentInit.checkoutUrl,              // ✅
            providerPaymentId: paymentInit.providerPaymentId,  // ✅ opcional
        },

        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };


    }

    async confirmPayment(payload: {
        provider: PaymentProvider;
        providerPaymentId: string;
        orderId: string;
        amount: number;
        }) {
        const order = await this.prisma.order.findUnique({
            where: { id: payload.orderId },
        });

        // Idempotencia + seguridad
        if (!order || order.status !== 'pending_payment') {
            return;
        }

        await this.prisma.$transaction([
            this.prisma.orderPayment.updateMany({
            where: {
                orderId: payload.orderId,
                provider: payload.provider,
            },
            data: {
                status: 'paid',
                providerPaymentId: String(payload.providerPaymentId),
            },
            }),

            this.prisma.order.update({
            where: { id: payload.orderId },
            data: { status: 'paid' },
            }),
        ]);

        console.log(`✅ Orden ${payload.orderId} marcada como PAID`);
    }

    async getMyOrders(userId: string){
        const orders = await this.prisma.order.findMany({
            where: {
                customerId: userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                items: true,
                payments: true,
            },
        });

        return orders;
    }

    async getOrderById(data: { userId: string, orderId: string}){

        const order = await this.prisma.order.findUnique({
            where: {
                customerId: data.userId,
                id: data.orderId,
            },
            include: {
                items: true,
                payments: true,
            },
        });

        return order;
    }

}
