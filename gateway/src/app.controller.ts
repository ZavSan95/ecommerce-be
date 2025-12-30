import { Controller, Get, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CatalogPingResponse, GatewayPingedEvent } from '@ecommerce/contracts';
import { Subjects } from './messaging/subjects';

@Controller('api')
export class AppController {
  constructor(
    private readonly http: HttpService,
    @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
  ) {}

  @Get('catalog/ping')
  async pingCatalog() {
    const response = await firstValueFrom(
      this.http.get<CatalogPingResponse>('http://localhost:3001/ping'),
    );

    const event: GatewayPingedEvent = {
      event: Subjects.GatewayPinged,
      at: new Date().toISOString(),
      source: 'gateway',
    };

    this.natsClient.emit(event.event, event);

    return {
      gateway: 'ok',
      catalogResponse: response.data,
    };
  }
}
