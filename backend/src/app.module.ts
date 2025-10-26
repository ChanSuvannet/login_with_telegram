import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramController } from './auth/telegram-login.controller';
import { TelegramService } from './auth/telegram-login.service';
import { TelegramGateway } from './auth/telegram.gateway';

@Module({
  imports: [],
  controllers: [AppController, TelegramController],
  providers: [AppService, TelegramService, TelegramGateway],
})
export class AppModule {}
