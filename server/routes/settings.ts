import { Router } from 'express';
import { getSetting, setSetting } from '../settings.js';

const router = Router();

/** GET /api/settings - returns masked API key status */
router.get('/', async (_req, res) => {
  try {
    const keys = {
      tmdb_api_key: {
        configured: !!(await getSetting('tmdb_api_key')),
        masked: (await getSetting('tmdb_api_key'))
          ? '••••••••••••'
          : 'Not configured',
      },
      google_books_api_key: {
        configured: !!(await getSetting('google_books_api_key')),
        masked: (await getSetting('google_books_api_key'))
          ? '••••••••••••'
          : 'Not configured',
      },
      jikan_api_key: {
        configured: !!(await getSetting('jikan_api_key')),
        masked: (await getSetting('jikan_api_key'))
          ? '••••••••••••'
          : 'Not configured',
      },
    };

    res.json(keys);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch settings';
    res.status(500).json({ error: message });
  }
});

/** PUT /api/settings - update masked API key values (from settings console) */
router.put('/', async (req, res) => {
  const body = req.body as {
    tmdb_api_key?: string;
    google_books_api_key?: string;
    jikan_api_key?: string;
  };

  if (!body) {
    return res.status(400).json({ error: 'No settings provided' });
  }

  try {
    await setSetting('tmdb_api_key', body.tmdb_api_key || '');
    await setSetting('google_books_api_key', body.google_books_api_key || '');
    await setSetting('jikan_api_key', body.jikan_api_key || '');

    const updated = {
      tmdb_api_key: {
        configured: !!(body.tmdb_api_key),
        masked: body.tmdb_api_key ? '••••••••••••' : 'Not configured',
      },
      google_books_api_key: {
        configured: !!(body.google_books_api_key),
        masked: body.google_books_api_key ? '••••••••••••' : 'Not configured',
      },
      jikan_api_key: {
        configured: !!(body.jikan_api_key),
        masked: body.jikan_api_key ? '••••••••••••' : 'Not configured',
      },
    };
    res.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save settings';
    res.status(500).json({ error: message });
  }
});

export default router;