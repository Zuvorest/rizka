const pool = require('./db');
const { ensureSchema } = require('./schema');
const { seedAdmin } = require('./auth');

async function init() {
  try {
    await ensureSchema();
    const admin = await seedAdmin(pool);
    console.log(`✅ Tabel database siap. Admin: ${admin}`);

    const result = await pool.query('SELECT COUNT(*) FROM shortlinks');
    console.log(`📊 Jumlah shortlink tersimpan: ${result.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

init();
