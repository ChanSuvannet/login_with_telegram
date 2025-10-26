// backend/src/auth/telegram-auth.service.ts
import { HttpService } from '@nestjs/axios';
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import ipLocation from 'iplocation';
import { firstValueFrom } from 'rxjs';

interface PendingLogin {
    payload: any;
    chatId: number;
    messageId: number;
    ip: string;
    location: string;
    browser: string;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

@Injectable()
export class TelegramAuthService {
    private readonly botToken = '8116699542:AAGHxxumG8RrO8DiH0-y_Xhojih-vhUj_Ik';
    private readonly botUsername = 'ccn_assistant168_bot';
    private readonly pending = new Map<string, PendingLogin>();

    constructor(private readonly http: HttpService) { }

    /** Step 1 – Called from frontend (static button) */
    async startLogin(payload: any) {
        // Allow empty payload for static button
        let userId: number;
        let first_name = 'Guest';
        let username = 'guest';

        if (payload.id) {
            // From Telegram widget
            const check = this.verifyTelegramData(payload);
            if (!check) throw new BadRequestException('Invalid Telegram data');
            userId = payload.id;
            first_name = payload.first_name || 'User';
            username = payload.username || 'unknown';
        } else {
            // Static button → fake user
            userId = Date.now();
        }

        const chatId = userId;

        // Get IP & location
        const ip = this.getClientIp();
        const locationInfo = await ipLocation(ip).catch(() => ({ city: '??', country: '??' }));
        const location = '';
        const browser = payload.browser || 'Unknown';

        // Send message to Telegram
        const keyboard = {
            inline_keyboard: [
                [
                    { text: 'Confirm', callback_data: `accept_${userId}` },
                    { text: 'Decline', callback_data: `decline_${userId}` },
                ],
            ],
        };

        const text = `*Login request*\n\n` +
            `To authorize this request, use the buttons below.\n\n` +
            `**Browser:** ${browser}\n` +
            `**IP:** ${ip} (${location})\n\n` +
            `If you didn't request this, press *Decline* or ignore.`;

        const msg = await this.sendMessage(chatId, text, keyboard);
        const messageId = msg.result.message_id;

        // Store pending
        const token = this.generateToken(userId);
        const pending: PendingLogin = {
            payload: { id: userId, first_name, username },
            chatId,
            messageId,
            ip,
            location,
            browser,
            resolve: null!,
            reject: null!,
        };

        const promise = new Promise((res, rej) => {
            pending.resolve = res;
            pending.reject = rej;
        });

        this.pending.set(token, pending);

        // Return to frontend
        return {
            confirmUrl: `https://t.me/${this.botUsername}?start=confirm_${token}`,
            token,
            ip,
            location,
            browser,
            user: { id: userId, first_name, username },
        };
    }

    /** Step 2 – User clicks Confirm/Decline in Telegram */
    async handleCallback(update: any) {
        const cb = update.callback_query;
        if (!cb) return;

        const [action, userIdStr] = cb.data.split('_');
        const userId = Number(userIdStr);
        const chatId = cb.message.chat.id;
        const messageId = cb.message.message_id;

        const token = [...this.pending.entries()]
            .find(([, p]) => p.chatId === chatId && p.payload.id === userId)?.[0];

        if (!token) {
            await this.answerCallback(cb.id, 'Session expired');
            return;
        }

        const pending = this.pending.get(token)!;
        const accepted = action === 'accept';

        const resultText = accepted
            ? 'Accepted\nYou have successfully logged in.'
            : 'Declined\nLogin request rejected.';

        const editKeyboard = accepted
            ? { inline_keyboard: [[{ text: 'Terminate session', callback_data: `term_${userId}` }]] }
            : null;

        await this.editMessage(chatId, messageId, resultText, editKeyboard);

        if (accepted) {
            pending.resolve({
                user: pending.payload,
                ip: pending.ip,
                location: pending.location,
                browser: pending.browser,
                sessionToken: token,
            });
        } else {
            pending.reject(new Error('User declined login'));
        }
    }

    /** Step 3 – Web Confirm/Decline */
    async finalizeLogin(token: string, accepted: boolean) {
        const pending = this.pending.get(token);
        if (!pending) throw new BadRequestException('Invalid or expired token');

        if (accepted) {
            this.pending.delete(token);
            return {
                user: pending.payload,
                ip: pending.ip,
                location: pending.location,
                browser: pending.browser,
                sessionToken: token,
            };
        } else {
            this.pending.delete(token);
            throw new BadRequestException('Login declined');
        }
    }

    async terminateSession(userId: string) {
        return { ok: true, message: 'Session terminated' };
    }

    // =============================================
    // Helper Methods
    // =============================================

    private verifyTelegramData(data: any): boolean {
        if (!data.hash) return false;

        const hash = data.hash;
        delete data.hash;

        const dataCheckString = Object.keys(data)
            .sort()
            .map((k) => `${k}=${data[k]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(this.botToken).digest();
        const secretWordArray = CryptoJS.enc.Hex.parse(secretKey.toString('hex'));

        const calculated = CryptoJS.HmacSHA256(dataCheckString, secretWordArray).toString(CryptoJS.enc.Hex);

        return calculated === hash;
    }

    private generateToken(userId: number): string {
        return CryptoJS.SHA256(`${userId}-${Date.now()}-${Math.random()}`).toString(CryptoJS.enc.Hex);
    }

    private async sendMessage(chatId: number, text: string, keyboard?: any) {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        return firstValueFrom(
            this.http.post(url, {
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            })
        ).then((r) => r.data);
    }

    private async editMessage(chatId: number, messageId: number, text: string, keyboard?: any) {
        const url = `https://api.telegram.org/bot${this.botToken}/editMessageText`;
        return firstValueFrom(
            this.http.post(url, {
                chat_id: chatId,
                message_id: messageId,
                text,
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            })
        ).then((r) => r.data);
    }

    private async answerCallback(callbackId: string, text: string) {
        const url = `https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`;
        return firstValueFrom(
            this.http.post(url, { callback_query_id: callbackId, text })
        ).then((r) => r.data);
    }

    private getClientIp(): string {
        return '127.0.0.1'; // In production: req.ip
    }
}