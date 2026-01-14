import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module'; 
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

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

  app.use(cookieParser());
    
  const document = SwaggerModule.createDocument(app, config); 
  
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000); 

} bootstrap();