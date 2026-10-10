import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();
function rowToMedia(row) {
    return {
        id: `${row.type}:${row.provider_id}`,
        providerId: String(row.provider_id),
        type: row.type,
        title: String(row.title),
        poster: String(row.poster ?? ''),
        year: String(row.year ?? ''),
        rating: Number(row.rating ?? 0),
        genres: row.genres ?? [],
        meta: row.meta ?? {},
    };
}
// GET /api/bookmarks?type=movie&status=watchlist
router.get('/', async (req, res) => {
    const type = String(req.query.type ?? '');
    const status = String(req.query.status ?? '');
    const filters = [];
    const params = [];
    if (type) {
        params.push(type);
        filters.push(`type = $${params.length}`);
    }
    if (status) {
        params.push(status);
        filters.push(`status = $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    try {
        const result = await pool.query(`SELECT * FROM bookmarks ${where} ORDER BY created_at DESC`, params);
        const rows = result.rows.map((row) => ({
            ...rowToMedia(row),
            status: row.status,
        }));
        res.json(rows);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load bookmarks';
        res.status(500).json({ error: message });
    }
});
// POST /api/bookmarks — add or update a bookmark
router.post('/', async (req, res) => {
    const body = req.body;
    if (!body.type || !body.providerId || !body.title) {
        return res.status(400).json({ error: 'type, providerId and title are required' });
    }
    try {
        const result = await pool.query(`INSERT INTO bookmarks (type, provider_id, status, title, poster, year, rating, genres, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (type, provider_id)
       DO UPDATE SET
         status = EXCLUDED.status,
         title = EXCLUDED.title,
         poster = EXCLUDED.poster,
         year = EXCLUDED.year,
         rating = EXCLUDED.rating,
         genres = EXCLUDED.genres,
         meta = EXCLUDED.meta,
         updated_at = NOW()
       RETURNING *`, [
            body.type,
            body.providerId,
            body.status ?? 'watchlist',
            body.title,
            body.poster ?? '',
            body.year ?? 'Unknown',
            body.rating ?? 0,
            JSON.stringify(body.genres ?? []),
            JSON.stringify(body.meta ?? {}),
        ]);
        const row = result.rows[0];
        res.status(201).json({ ...rowToMedia(row), status: row.status });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save bookmark';
        res.status(500).json({ error: message });
    }
});
// PATCH /api/bookmarks/status — flip watchlist ↔ watched
router.patch('/status', async (req, res) => {
    const { type, providerId, status } = req.body;
    if (!type || !providerId || !status) {
        return res.status(400).json({ error: 'type, providerId and status are required' });
    }
    if (status !== 'watchlist' && status !== 'watched') {
        return res.status(400).json({ error: 'status must be watchlist or watched' });
    }
    try {
        const result = await pool.query(`UPDATE bookmarks SET status = $1, updated_at = NOW()
       WHERE type = $2 AND provider_id = $3
       RETURNING *`, [status, type, providerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }
        res.json({ ...rowToMedia(result.rows[0]), status });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update bookmark';
        res.status(500).json({ error: message });
    }
});
// DELETE /api/bookmarks?type=movie&providerId=xxx
router.delete('/', async (req, res) => {
    const type = String(req.query.type ?? '');
    const providerId = String(req.query.providerId ?? '');
    if (!type || !providerId) {
        return res.status(400).json({ error: 'type and providerId are required' });
    }
    try {
        await pool.query('DELETE FROM bookmarks WHERE type = $1 AND provider_id = $2', [type, providerId]);
        res.status(204).end();
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete bookmark';
        res.status(500).json({ error: message });
    }
});
export default router;
//# sourceMappingURL=bookmarks.js.map