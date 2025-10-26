import { Injectable } from '@nestjs/common';
import { TelegramLoginDto } from './telegram-login.dto';
import { verifyTelegramAuth } from './telegram-validator';
import { TelegramGateway } from './telegram.gateway';

@Injectable()
export class TelegramService {
  constructor(private readonly gateway: TelegramGateway) { }

  async handleLogin(user: TelegramLoginDto, headers: any) {
    if (!verifyTelegramAuth(user as any)) {
      throw new Error('Invalid Telegram authentication data');
    }

    const ip = headers['x-forwarded-for'] || headers['remoteAddress'];
    const browser = headers['user-agent'];

    const result = {
      message: 'Login successful',
      user,
      ip,
      location: 'Phnom Penh, Cambodia',
      browser,
    };

    // Broadcast login success event
    this.gateway.broadcast({
      event: 'LOGIN_SUCCESS',
      user,
      ip,
      browser,
    });

    return result;
  }

  async terminateSession(userId: string) {
    this.gateway.broadcast({
      event: 'SESSION_TERMINATED',
      userId,
    });
    return { message: `Session terminated for user ${userId}` };
  }
}
