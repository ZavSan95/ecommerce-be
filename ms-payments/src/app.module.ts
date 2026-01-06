import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { NatsModule } from './nats/nats.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoWebhookController } from './webhooks/mercadopago.controller';

@Module({
  imports: [
    NatsModule,
    MercadopagoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    })
  ],
  controllers: [AppController, MercadoPagoWebhookController],
})
export class AppModule {}
