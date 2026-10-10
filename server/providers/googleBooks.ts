import { getSetting } from '../settings.js';
import { fetchJson } from './shared.js';
import type { MediaItem } from './shared.js';

const BASE_URL = 'https://www.googleapis.com/books/v1';

interface GoogleBooksResponse {
  kind: string;
  totalItems?: number;
  items: GoogleBook[];
}

interface GoogleBook {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    imageLinks?: { smallThumbnail?: string; thumbnail?: string };
    categories?: string[];
    industryIdentifiers?: { type?: string; identifier?: string }[];
  };
}

/**
 * Book cover candidates, most-reliable first.
 * 1. Google Books' own thumbnail — but force HTTPS, since it sometimes returns
 *    http:// URLs that browsers block on an https origin (mixed content).
 * 2. OpenLibrary's covers API from the book's ISBN — a keyless, stable HTTPS
 *    endpoint, used whenever Google Books has no imageLinks.
 */
function posterFor(info: GoogleBook['volumeInfo']): string {
  const direct = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
  if (direct) return direct.replace(/^http:\/\//i, 'https://');

  const isbn = (info.industryIdentifiers ?? []).find((i) =>
    i.type === 'ISBN_13' || i.type === 'ISBN_10'
  )?.identifier;
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : '';
}

function normalize(item: GoogleBook): MediaItem {
  const info = item.volumeInfo ?? {};
  const photo = posterFor(info);
  const year = info.publishedDate ? info.publishedDate.substring(0, 4) : 'Unknown';
  const meta: Record<string, string | number | undefined> = {
    author: info.authors?.[0],
    pages: info.pageCount,
  };

  return {
    id: `book:${item.id}`,
    providerId: `book:${item.id}`,
    type: 'book',
    title: info.title ?? 'Untitled',
    poster: photo,
    year,
    rating: 0,
    genres: info.categories ?? [],
    overview: info.description,
    meta,
  };
}

async function apiKey(): Promise<string> {
  const key = await getSetting('google_books_api_key');
  return key; // Google Books works without a key; optional for higher quota
}

export async function searchGoogleBooks(q: string): Promise<MediaItem[]> {
  const key = await apiKey();
  const url = `${BASE_URL}/volumes?q=${encodeURIComponent(q)}&maxResults=20` + (key ? `&key=${key}` : '');
  const data = await fetchJson<GoogleBooksResponse>(url);
  return (data.items ?? []).map(normalize).slice(0, 20);
}

export async function trendingGoogleBooks(): Promise<MediaItem[]> {
  // No trending endpoint on Google Books — surface recently published titles.
  const key = await apiKey();
  const url =
    `${BASE_URL}/volumes?q=subject:fiction&orderBy=newest&maxResults=12` +
    (key ? `&key=${key}` : '');
  const data = await fetchJson<GoogleBooksResponse>(url);
  return (data.items ?? []).map(normalize).slice(0, 12);
}