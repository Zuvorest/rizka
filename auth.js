const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 32;
const HASH_PATTERN = /^scrypt:[0-9a-f]{32}:[0-9a-f]{64}$/;

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, KEY_LENGTH);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || !HASH_PATTERN.test(String(stored))) return false;

  const [, saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function adminCredentials() {
  const username = process.env.ADMIN_USER;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !/^[A-Za-z0-9._-]{3,50}$/.test(username)) {
    throw new Error('ADMIN_USER tidak valid. Isi 3-50 karakter huruf, angka, titik, garis bawah, atau strip.');
  }
  if (!HASH_PATTERN.test(String(passwordHash))) {
    throw new Error('ADMIN_PASSWORD_HASH belum diisi. Jalankan: npm run set-password');
  }

  return { username, passwordHash };
}

async function seedAdmin(pool) {
  const { username, passwordHash } = adminCredentials();
  await pool.query(
    `INSERT INTO users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [username, passwordHash]
  );
  return username;
}

module.exports = { hashPassword, verifyPassword, adminCredentials, seedAdmin };
