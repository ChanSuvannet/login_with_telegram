import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Query,
} from '@nestjs/common';
import { TelegramAuthService } from './telegram-auth.service';

@Controller('api/auth/telegram')
export class TelegramAuthController {
    constructor(private readonly service: TelegramAuthService) { }

    @Post('webhook')
    async handleUpdate(@Body() update: any) {
        // Handle Telegram callback updates
        await this.service.handleCallback(update);
        return { ok: true };
    }

    @Post('login')
    async login(@Body() payload: any) {
        return this.service.startLogin(payload);
    }

    @Get('confirm')
    async confirm(@Query('token') token: string, @Query('accept') accept: string) {
        if (!token) throw new BadRequestException('Missing token');
        const accepted = accept === 'true';
        return this.service.finalizeLogin(token, accepted);
    }

    @Get('terminate')
    async terminate(@Query('userId') userId: string) {
        return this.service.terminateSession(userId);
    }
}