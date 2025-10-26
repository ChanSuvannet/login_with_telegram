import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TelegramAuthController } from './telegram-auth.controller';
import { TelegramAuthService } from './telegram-auth.service';

@Module({
  imports: [HttpModule],
  controllers: [TelegramAuthController],
  providers: [TelegramAuthService],
})
export class TelegramAuthModule {}