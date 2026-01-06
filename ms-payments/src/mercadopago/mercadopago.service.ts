import { Injectable } from '@nestjs/common';
import * as mercadopago from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private preference: mercadopago.Preference;
  private payment: mercadopago.Payment;

  constructor() {
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    this.preference = new mercadopago.Preference(client);
    this.payment = new mercadopago.Payment(client);
  }

  async createPreference(data: {
    orderId: string;
    amount: number;
    description?: string;
  }) {
    const body = {
      items: [
        {
          id: data.orderId,
          title: data.description ?? 'Compra',
          quantity: 1,
          unit_price: data.amount,
          currency_id: 'ARS',
        },
      ],

      external_reference: data.orderId,

      // 🔥 DEFINIDAS SIEMPRE
      back_urls: {
        success: `https://subarborescent-rumblingly-sumiko.ngrok-free.dev/orders/checkout/success?orderId=${data.orderId}`,
        failure: `https://subarborescent-rumblingly-sumiko.ngrok-free.dev/orders/checkout/failure?orderId=${data.orderId}`,
        pending: `https://subarborescent-rumblingly-sumiko.ngrok-free.dev/orders/checkout/pending?orderId=${data.orderId}`,
      },

      auto_return: 'approved',
    };

    // 🔍 LOG CRÍTICO
    console.log('🧾 MP preference body:', JSON.stringify(body, null, 2));

    const response = await this.preference.create({ body });

    return {
      providerPaymentId: response.id!,
      checkoutUrl: response.sandbox_init_point!,
    };
  }

  async getPayment(paymentId: string) {
    return this.payment.get({ id: paymentId });
  }

  async findApprovedPaymentByOrder(orderId: string): Promise<{
    status: 'paid';
    providerPaymentId: string;
    amount: number;
  } | null> {
    const result = await this.payment.search({
      options: {
        external_reference: orderId,
        sort: 'date_created',
        criteria: 'desc',
      },
    });

    if (!result?.results?.length) {
      return null;
    }

    const approved = result.results.find(p => p.status === 'approved');

    if (
      !approved ||
      !approved.id ||
      typeof approved.transaction_amount !== 'number'
    ) {
      return null;
    }

    return {
      status: 'paid',
      providerPaymentId: approved.id,
      amount: approved.transaction_amount,
    };
  }
}
