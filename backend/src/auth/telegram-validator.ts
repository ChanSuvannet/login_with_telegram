import * as crypto from 'crypto';

const BOT_TOKEN = "8116699542:AAGHxxumG8RrO8DiH0-y_Xhojih-vhUj_Ik";
const SECRET_KEY = crypto.createHash('sha256').update(BOT_TOKEN).digest();

export function verifyTelegramAuth(data: Record<string, string>): boolean {
    const checkHash = data.hash;
    const dataCheckArr: string[] = [];

    for (const key in data) {
        if (key !== 'hash') {
            dataCheckArr.push(`${key}=${data[key]}`);
        }
    }

    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');
    const hmac = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(dataCheckString)
        .digest('hex');

    return hmac === checkHash;
}
