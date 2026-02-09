import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module'; 
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() { 
  
  const app = await NestFactory.create(AppModule); 

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  app.setGlobalPrefix('api'); const config = new DocumentBuilder() 
    .setTitle('Ecommerce API Gateway') 
    .setDescription('API pública del sistema ecommerce') 
    .setVersion('1.0') 
    .addBearerAuth() // para JWT más adelante 
    .build(); 

  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'uploads')),
  );

  app.use(cookieParser());

  const allowedOrigins = [
    'http://localhost:3001',
    'https://ecommerce-fe.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // SSR / Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });
    
  const document = SwaggerModule.createDocument(app, config); 
  
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000); 

} bootstrap();