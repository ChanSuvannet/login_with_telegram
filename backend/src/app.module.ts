import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramAuthModule } from './auth/telegram-auth.module';

@Module({
  imports: [TelegramAuthModule],
  controllers: [AppController,],
  providers: [AppService, ],
})
export class AppModule {}
