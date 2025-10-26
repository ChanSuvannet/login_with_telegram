const crypto = require('crypto');

const BOT_TOKEN = '8116699542:AAGHxxumG8RrO8DiH0-y_Xhojih-vhUj_Ik'; // CHANGE THIS

const user = {
  id: '987654321',
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  photo_url: 'https://t.me/i/userpic/320/johndoe.jpg',
  auth_date: Math.floor(Date.now() / 1000).toString(), // current Unix timestamp
};

// Build data-check-string (sorted alphabetically)
const dataCheckString = Object.keys(user)
  .sort()
  .map(key => `${key}=${user[key]}`)
  .join('\n');

console.log('data_check_string:\n', dataCheckString);

// Generate hash
const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
const hash = crypto.createHmac('sha256', secretKey)
  .update(dataCheckString)
  .digest('hex');

console.log('\nhash:', hash);

// Final payload
const payload = { ...user, hash };
console.log('\nPOSTMAN BODY (JSON):');
console.log(JSON.stringify(payload, null, 2));