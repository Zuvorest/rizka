require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('./auth');

const password = process.argv[2] || crypto.randomBytes(18).toString('base64url');

if (password.length < 12) {
  console.error('Password minimal 12 karakter.');
  process.exit(1);
}

const envPath = path.join(__dirname, '.env');
const line = `ADMIN_PASSWORD_HASH=${hashPassword(password)}`;
let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (/^ADMIN_PASSWORD_HASH=.*$/m.test(env)) {
  env = env.replace(/^ADMIN_PASSWORD_HASH=.*$/m, line);
} else {
  env = `${env.trimEnd()}\n${line}\n`;
}

fs.writeFileSync(envPath, env, { mode: 0o600 });
console.log(`Password admin: ${password}`);
console.log('Hash tersimpan di .env. Restart server untuk menerapkan.');
