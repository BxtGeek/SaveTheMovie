import { pool } from './db.js';
export async function getSetting(key) {
    const res = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows[0]?.value ?? '';
}
export async function setSetting(key, value) {
    await pool.query(`INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`, [key, value]);
}
//# sourceMappingURL=settings.js.map