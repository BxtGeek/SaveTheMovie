import { Router } from 'express';
import type { MediaItem, MediaType } from '../providers/shared.js';
import { searchTmdb, trendingTmdb } from '../providers/tmdb.js';
import { searchJikan, trendingJikan } from '../providers/jikan.js';
import { searchBooks, trendingBooks } from '../providers/books.js';

const router = Router();

type SearchFn = (q: string) => Promise<MediaItem[]>;
type TrendingFn = () => Promise<MediaItem[]>;

const providers: Record<MediaType, { search: SearchFn; trending: TrendingFn }> = {
  movie: { search: searchTmdb, trending: trendingTmdb },
  anime: { search: searchJikan, trending: trendingJikan },
  book: { search: searchBooks, trending: trendingBooks },
};

// --- Trending cache -----------------------------------------------------------
// The "top 12" defaults are the first thing every visitor sees, so serve them
// instantly from a 6-hour in-memory cache, and when every upstream is down fall
// back to the last-good snapshot instead of an empty error screen.
const TRENDING_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const trendingCache = new Map<MediaType, { results: MediaItem[]; fetchedAt: number }>();

async function loadTrending(type: MediaType): Promise<{ results: MediaItem[]; cached: boolean }> {
  const cached = trendingCache.get(type);
  if (cached && Date.now() - cached.fetchedAt < TRENDING_TTL_MS) {
    return { results: cached.results, cached: true };
  }

  try {
    const results = await providers[type].trending();
    trendingCache.set(type, { results, fetchedAt: Date.now() });
    return { results, cached: false };
  } catch (err) {
    if (cached) return { results: cached.results, cached: true }; // stale beats nothing
    throw err;
  }
}

/** Pre-populate the cache at boot so the homepage never lands empty. */
export async function warmTrendingCache(): Promise<void> {
  await Promise.allSettled(
    (Object.keys(providers) as MediaType[]).map((type) => loadTrending(type))
  );
}

// GET /api/search?q=...&type=movie|anime|book
router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const type = String(req.query.type ?? 'movie') as MediaType;

  if (!q) {
    return res.json({ results: [] });
  }

  const provider = providers[type] ?? providers.movie;
  try {
    const results = await provider.search(q);
    return res.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    const status =
      err && typeof err === 'object' && 'status' in err
        ? (err as { status: number }).status
        : 502;
    return res.status(status).json({ error: message });
  }
});

// GET /api/trending?type=movie|anime|book (cached)
router.get('/trending', async (req, res) => {
  const type = String(req.query.type ?? 'movie') as MediaType;

  if (!(type in providers)) {
    return res.status(400).json({ error: `Unknown category: ${type}` });
  }

  try {
    const { results, cached } = await loadTrending(type);
    res.set('X-Trending-Cache', cached ? 'hit' : 'miss');
    return res.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load trending';
    const status =
      err && typeof err === 'object' && 'status' in err
        ? (err as { status: number }).status
        : 502;
    return res.status(status).json({ error: message });
  }
});

export default router;