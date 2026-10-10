import { fetchJson } from './shared.js';
import type { MediaItem } from './shared.js';

/**
 * Keyless fallback provider for books. Used when the Google Books API is
 * rate-limited (anonymous quota) or unavailable, so book search keeps working
 * without configuration.
 */
const BASE_URL = 'https://openlibrary.org';
const SEARCH_FIELDS =
  'key,title,author_name,first_publish_year,cover_i,subject';

interface OpenLibraryResult {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryResult[];
}

function normalize(doc: OpenLibraryResult): MediaItem {
  const key = doc.key?.replace('/works/', '') ?? doc.title ?? '';
  return {
    id: `book:${key}`,
    providerId: `book:${key}`,
    type: 'book',
    title: doc.title ?? 'Untitled',
    poster: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
    year: doc.first_publish_year ? String(doc.first_publish_year) : 'Unknown',
    rating: 0,
    genres: (doc.subject ?? []).slice(0, 5),
    meta: { author: doc.author_name?.[0] },
  };
}

export async function searchOpenLibrary(q: string): Promise<MediaItem[]> {
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(q)}&limit=20&mode=everything&fields=${SEARCH_FIELDS}`;
  const data = await fetchJson<OpenLibrarySearchResponse>(url);
  return data.docs.map(normalize).slice(0, 20);
}

export async function trendingOpenLibrary(): Promise<MediaItem[]> {
  // No trending endpoint — surface recent fiction, mirroring the Google Books default.
  const url = `${BASE_URL}/search.json?q=subject:fiction&sort=new&limit=12&fields=${SEARCH_FIELDS}`;
  const data = await fetchJson<OpenLibrarySearchResponse>(url);
  return data.docs.map(normalize).slice(0, 12);
}