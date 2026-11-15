const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test koneksi saat startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database Neon terhubung'))
  .catch(err => console.error('❌ Gagal konek DB:', err.message));

module.exports = pool;