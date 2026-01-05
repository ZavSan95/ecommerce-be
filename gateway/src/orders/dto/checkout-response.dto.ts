import { OrderStatus, PaymentProvider, PaymentStatus } from "@prisma/client";


export class CheckoutResponseDto {
  orderId: string;
  orderNumber: string;

  status: OrderStatus;
  currency: string;

  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };

  payment: {
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: number;
  };

  expiresAt?: Date;
}
