import { OrderStatus } from "../enum/order-status.enum";
import { PaymentProvider } from "../enum/payment-provider.enum";
import { PaymentStatus } from "../enum/payment-status.enum";

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
    checkoutUrl?: string;   // ✅
    providerPaymentId?: string; // ✅ opcional
  };

  expiresAt?: Date;
}
