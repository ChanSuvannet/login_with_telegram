import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { TelegramLoginDto } from './telegram-login.dto';
import { TelegramService } from './telegram-login.service';

@Controller('api/auth/telegram')
export class TelegramController {
  constructor(private readonly service: TelegramService) { }

  @Post('login')
  async telegramLogin(@Body() user: TelegramLoginDto, @Req() req: any) {
    return this.service.handleLogin(user, req.headers);
  }

  @Get('terminate')
  async terminate(@Query('userId') userId: string) {
    return this.service.terminateSession(userId);
  }
}
