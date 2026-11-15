require('dotenv').config();

const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const PgSession = require('connect-pg-simple')(session);
const crypto = require('crypto');
const path = require('path');

const pool = require('./db');
const { ensureSchema } = require('./schema');
const { hashPassword, verifyPassword, seedAdmin } = require('./auth');
const { renderSafelink, renderErrorPage, SMARTLINK_URL, WAIT_SECONDS, FINAL_SECONDS } = require('./safelink');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET wajib diisi minimal 32 karakter.');
}

/* Dipakai saat username tidak ada supaya waktu respons login tetap sama. */
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

function resolveBaseUrl(value) {
  let base = String(value || 'https://vriz.my.id').trim();
  if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
  try {
    const parsed = new URL(base);
    return `${parsed.protocol}//${parsed.host}`;
  } catch (error) {
    return 'https://vriz.my.id';
  }
}

const BASE_URL = resolveBaseUrl(
  process.env.SHORTLINK_BASE_URL || process.env.BASE_URL || 'https://vriz.my.id'
);

const CODE_LENGTH = 5;
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const CODE_PATTERN = /^[A-Za-z0-9]{4,12}$/;

/* ====== MIDDLEWARE ====== */
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();

  const hostFrom = (value) => {
    try {
      return new URL(value).host;
    } catch (error) {
      return null;
    }
  };

  const origin = req.get('origin');
  const referer = req.get('referer');
  const expectedHost = req.get('host');
  const fromSameOrigin = origin
    ? hostFrom(origin) === expectedHost
    : Boolean(referer && hostFrom(referer) === expectedHost);

  if (fromSameOrigin) return next();
  return res.status(403).json({ error: 'Permintaan ditolak.' });
});

app.use(session({
  store: new PgSession({ pool, tableName: 'session', createTableIfMissing: true }),
  name: 'vriz.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: 'auto',
    maxAge: 1000 * 60 * 60 * 2
  }
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }
});

/* ====== HELPERS ====== */
function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

function shortUrlFor(code) {
  return `${BASE_URL}/${code}`;
}

function linkJson(row) {
  return {
    id: row.id,
    title: row.title,
    original_url: row.original_url,
    short_code: row.short_code,
    short_url: shortUrlFor(row.short_code),
    status: row.status,
    clicks: Number(row.clicks),
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_visited_at: row.last_visited_at
  };
}

function normalizeMediafireUrl(input) {
  if (typeof input !== 'string') return null;

  let value = input.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  let parsed;
  try {
    parsed = new URL(value);
  } catch (error) {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.username || parsed.password) return null;

  const host = parsed.hostname.toLowerCase();
  const isMediafire = host === 'mediafire.com' || host.endsWith('.mediafire.com');
  if (!isMediafire) return null;
  if (parsed.pathname === '/' || parsed.pathname === '') return null;

  parsed.protocol = 'https:';
  parsed.hash = '';
  return parsed.toString();
}

function normalizeTitle(input) {
  if (typeof input !== 'string') return null;
  const title = input.trim().replace(/\s+/g, ' ');
  if (title.length < 2 || title.length > 160) return null;
  return title;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeHttpUrl(input, maxLength = 2048) {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  if (!value || value.length > maxLength) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch (error) {
    return null;
  }
}

function normalizeText(input, maxLength) {
  if (typeof input !== 'string') return null;
  const value = input.trim().replace(/\s+/g, ' ');
  if (!value || value.length > maxLength) return null;
  return value;
}

/* ====== MIDDLEWARE PROTEKSI ====== */
function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn && req.session.userId) return next();
  return res.redirect('/login.html');
}

function requireAuthApi(req, res, next) {
  if (req.session && req.session.loggedIn && req.session.userId) return next();
  return res.status(401).json({ error: 'Sesi berakhir. Masuk kembali.' });
}

/* ====== ROUTE: LOGIN ====== */
function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

app.post('/login', loginLimiter, async (req, res) => {
  const { username, password, remember } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length > 50 ||
    password.length > 200
  ) {
    return res.status(401).json({ success: false, message: 'Username atau password salah.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];
    const valid = await verifyPassword(
      password,
      user && user.password_hash ? user.password_hash : DUMMY_HASH
    );

    if (!valid || !user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    await regenerateSession(req);
    req.session.loggedIn = true;
    req.session.user = user.username;
    req.session.userId = user.id;

    if (remember) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
    }

    await saveSession(req);
    return res.json({ success: true, redirect: '/dashboard.html' });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Login gagal. Coba lagi.' });
  }
});

/* ====== ROUTE: DASHBOARD ====== */
app.get('/dashboard.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

/* ====== FILE STATIS ====== */
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiLimiter);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

/* ====== ROUTE: LOGOUT ====== */
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('vriz.sid');
    res.json({ success: true });
  });
});

/* ====== ROUTE: ROOT ====== */
app.get('/', (req, res) => {
  if (req.session && req.session.loggedIn) {
    return res.redirect('/dashboard.html');
  }
  res.redirect('/login.html');
});

/* ====== API: KONFIGURASI ====== */
app.get('/api/config', requireAuthApi, (req, res) => {
  res.json({
    baseUrl: BASE_URL,
    username: req.session.user,
    smartlink: SMARTLINK_URL,
    waitSeconds: WAIT_SECONDS,
    finalSeconds: FINAL_SECONDS
  });
});

/* ====== API: SHORTLINKS (dilindungi) ====== */
app.get('/api/shortlinks', requireAuthApi, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await pool.query(
      `SELECT * FROM shortlinks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows.map(linkJson));
  } catch (error) {
    console.error('List shortlinks error:', error.message);
    res.status(500).json({ error: 'Gagal memuat daftar link.' });
  }
});

app.post('/api/shortlinks', requireAuthApi, async (req, res) => {
  const originalUrl = normalizeMediafireUrl(req.body && req.body.original_url);
  const title = normalizeTitle(req.body && req.body.title);

  if (!originalUrl) {
    return res.status(400).json({ error: 'Masukkan tautan Mediafire yang valid.' });
  }
  if (!title) {
    return res.status(400).json({ error: 'Judul harus 2 sampai 160 karakter.' });
  }

  try {
    const userId = req.session.userId;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = generateCode();
      try {
        const result = await pool.query(
          `INSERT INTO shortlinks (user_id, original_url, short_code, title)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, originalUrl, code, title]
        );
        return res.status(201).json(linkJson(result.rows[0]));
      } catch (error) {
        if (error.code === '23505') continue;
        throw error;
      }
    }

    return res.status(500).json({ error: 'Gagal membuat kode unik. Coba lagi.' });
  } catch (error) {
    console.error('Create shortlink error:', error.message);
    return res.status(500).json({ error: 'Gagal menyimpan link.' });
  }
});

app.put('/api/shortlinks/:id', requireAuthApi, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID link tidak valid.' });
  }

  const body = req.body || {};
  let originalUrl = null;
  let title = null;
  let status = null;

  if (body.original_url !== undefined) {
    originalUrl = normalizeMediafireUrl(body.original_url);
    if (!originalUrl) {
      return res.status(400).json({ error: 'Masukkan tautan Mediafire yang valid.' });
    }
  }

  if (body.title !== undefined) {
    title = normalizeTitle(body.title);
    if (!title) {
      return res.status(400).json({ error: 'Judul harus 2 sampai 160 karakter.' });
    }
  }

  if (body.status !== undefined) {
    if (body.status !== 'active' && body.status !== 'inactive') {
      return res.status(400).json({ error: 'Status tidak dikenal.' });
    }
    status = body.status;
  }

  if (!originalUrl && !title && !status) {
    return res.status(400).json({ error: 'Tidak ada perubahan yang dikirim.' });
  }

  try {
    const userId = req.session.userId;
    const result = await pool.query(
      `UPDATE shortlinks SET
         original_url = COALESCE($1, original_url),
         title = COALESCE($2, title),
         status = COALESCE($3, status),
         updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [originalUrl, title, status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link tidak ditemukan.' });
    }

    return res.json(linkJson(result.rows[0]));
  } catch (error) {
    console.error('Update shortlink error:', error.message);
    return res.status(500).json({ error: 'Gagal memperbarui link.' });
  }
});

app.delete('/api/shortlinks/:id', requireAuthApi, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID link tidak valid.' });
  }

  try {
    const userId = req.session.userId;
    const result = await pool.query(
      'DELETE FROM shortlinks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Link tidak ditemukan.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete shortlink error:', error.message);
    return res.status(500).json({ error: 'Gagal menghapus link.' });
  }
});

/* ====== API: SELESAIKAN SAFELINK (publik) ====== */
app.post('/api/shortlinks/:code/complete', async (req, res) => {
  const code = String(req.params.code || '');

  if (!CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: 'Link tidak ditemukan.' });
  }

  try {
    const result = await pool.query(
      `UPDATE shortlinks
       SET clicks = clicks + 1, last_visited_at = NOW()
       WHERE short_code = $1 AND status = 'active'
       RETURNING original_url`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link tidak aktif atau tidak ditemukan.' });
    }

    res.set('Cache-Control', 'no-store');
    return res.json({ url: result.rows[0].original_url });
  } catch (error) {
    console.error('Complete shortlink error:', error.message);
    return res.status(500).json({ error: 'Gagal membuka tautan.' });
  }
});

/* ====== API: IKLAN ====== */
app.get('/api/ads', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ads WHERE active = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('List ads error:', error.message);
    res.status(500).json({ error: 'Gagal memuat iklan.' });
  }
});

app.get('/api/ads/all', requireAuthApi, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('List all ads error:', error.message);
    res.status(500).json({ error: 'Gagal memuat iklan.' });
  }
});

app.post('/api/ads', requireAuthApi, async (req, res) => {
  const body = req.body || {};
  const name = normalizeText(body.name, 100);
  const url = normalizeHttpUrl(body.url);

  if (!name || !url) {
    return res.status(400).json({ error: 'Nama dan URL iklan tidak valid.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ads (name, url, placement, format)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, url, normalizeText(body.placement, 50), normalizeText(body.format, 20)]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Create ad error:', error.message);
    return res.status(500).json({ error: 'Gagal menyimpan iklan.' });
  }
});

app.put('/api/ads/:id', requireAuthApi, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'ID iklan tidak valid.' });
  }

  const body = req.body || {};
  const name = body.name === undefined ? null : normalizeText(body.name, 100);
  const url = body.url === undefined ? null : normalizeHttpUrl(body.url);
  const active = body.active === undefined ? null : body.active;

  if (body.name !== undefined && !name) {
    return res.status(400).json({ error: 'Nama iklan tidak valid.' });
  }
  if (body.url !== undefined && !url) {
    return res.status(400).json({ error: 'URL iklan tidak valid.' });
  }
  if (active !== null && typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Status iklan tidak valid.' });
  }

  try {
    const result = await pool.query(
      `UPDATE ads SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        placement = COALESCE($3, placement),
        format = COALESCE($4, format),
        active = COALESCE($5, active),
        updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, url, normalizeText(body.placement, 50), normalizeText(body.format, 20), active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Iklan tidak ditemukan.' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update ad error:', error.message);
    return res.status(500).json({ error: 'Gagal memperbarui iklan.' });
  }
});

app.delete('/api/ads/:id', requireAuthApi, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'ID iklan tidak valid.' });
  }

  try {
    await pool.query('DELETE FROM ads WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete ad error:', error.message);
    return res.status(500).json({ error: 'Gagal menghapus iklan.' });
  }
});

/* ====== ROUTE PUBLIK: SAFELINK ====== */
app.get('/:code', async (req, res, next) => {
  const code = req.params.code;

  if (!CODE_PATTERN.test(code)) return next();

  try {
    const result = await pool.query(
      'SELECT title, short_code, status FROM shortlinks WHERE short_code = $1',
      [code]
    );

    res.set('Cache-Control', 'no-store');
    res.type('html');

    if (result.rows.length === 0) {
      return res.status(404).send(renderErrorPage({
        title: 'Link tidak ditemukan',
        message: 'Kode shortlink ini tidak ada. Periksa kembali tautan yang Anda terima.',
        baseUrl: BASE_URL
      }));
    }

    const link = result.rows[0];

    if (link.status !== 'active') {
      return res.status(410).send(renderErrorPage({
        title: 'Link tidak aktif',
        message: 'Pemilik link menonaktifkan tautan ini. Hubungi pembuatnya untuk link baru.',
        baseUrl: BASE_URL
      }));
    }

    return res.send(renderSafelink({
      title: link.title,
      code: link.short_code,
      baseUrl: BASE_URL
    }));
  } catch (error) {
    console.error('Safelink render error:', error.message);
    return next(error);
  }
});

/* ====== 404 ====== */
app.use((req, res) => {
  res.status(404).send('Halaman tidak ditemukan');
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;

  if (status === 500) console.error('Unhandled error:', error.message);

  const message = status === 413
    ? 'Permintaan terlalu besar.'
    : status === 400
      ? 'Permintaan tidak valid.'
      : 'Terjadi kesalahan pada server.';

  res.status(status).send(message);
});

/* ====== START ====== */
async function start() {
  try {
    await ensureSchema();
    const adminUsername = await seedAdmin(pool);
    console.log(`✅ Skema database siap. Admin: ${adminUsername}`);
  } catch (error) {
    console.error('❌ Gagal menyiapkan database:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✅ Server jalan di ${BASE_URL} (port ${PORT})`);
  });
}

start();
