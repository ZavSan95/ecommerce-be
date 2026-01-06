import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NatsService } from './nats.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_SERVERS ?? 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  providers: [NatsService],
  exports: [ClientsModule, NatsService],
})
export class NatsModule {}
