import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableCors({
    origin: [
      'http://localhost:4444', // your Angular app
      'https://ariana-unresident-globally.ngrok-free.dev', // your Ngrok tunnel
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();
