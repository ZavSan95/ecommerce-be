import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, firstValueFrom } from 'rxjs';
import { CheckoutValidatedItem, CheckoutValidationResponse } from './types/products.types';
import { OrderItemInput } from './types/order-item.type';
import { PrismaService } from '../database/prisma.service';

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
            throw new BadRequestException('No se pudo validar el carrito');
        }
    }

    async createOrder(dto: CreateOrderDto): Promise<CheckoutResponseDto>{

        const validation: CheckoutValidationResponse =
            await this.validateProducts(dto.items);

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

        // =====================================================
        // 4. Response
        // =====================================================
        const payment = order.payments[0];

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
        },

        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };

    }
}
