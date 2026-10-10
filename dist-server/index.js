import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDb } from './db.js';
import searchRouter, { warmTrendingCache } from './routes/search.js';
import bookmarksRouter from './routes/bookmarks.js';
import settingsRouter from './routes/settings.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, name: 'stash' });
});
// API routes
app.use('/api', searchRouter); // provides /api/search and /api/trending
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/settings', settingsRouter);
// Serve the built React app (dist/) in production
const distDir = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    // SPA fallback — everything non-API goes to index.html
    app.get(/^\/(?!api).*/, (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
    });
}
const port = Number(process.env.PORT || 3000);
async function start() {
    try {
        await initDb();
        console.log('✅ PostgreSQL connected & schema ready');
    }
    catch (err) {
        console.error('❌ Failed to connect to PostgreSQL:', err instanceof Error ? err.message : err);
        console.error('   Is the database running? (docker compose up -d db)');
        process.exit(1);
    }
    app.listen(port, () => {
        console.log(`🗃️ Stash listening on http://localhost:${port}`);
        // Fire-and-forget: fill the trending cache so the homepage is never empty.
        void warmTrendingCache().then(() => console.log('🌤️ Trending cache warmed'));
    });
}
start();
//# sourceMappingURL=index.js.map