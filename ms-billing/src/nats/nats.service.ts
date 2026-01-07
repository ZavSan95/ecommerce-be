import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NatsService {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  emit(pattern: string, payload: unknown) {
    return this.client.emit(pattern, payload);
  }

  send<T = any>(pattern: string, payload: unknown) {
    return this.client.send<T>(pattern, payload);
  }
}
