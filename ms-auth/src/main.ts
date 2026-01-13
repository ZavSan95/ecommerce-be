import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVERS || 'nats://localhost:4222'],
      queue: 'auth-service'
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }),
  );

  await app.startAllMicroservices();

  await app.listen(process.env.AUTH_PORT ?? 3005);
}
bootstrap();
