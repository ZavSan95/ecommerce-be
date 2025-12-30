import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Microservice NATS
  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVERS || 'nats://localhost:4222'],
    },
  });

  await app.startAllMicroservices();
  
  await app.listen(3001);
}
bootstrap();
