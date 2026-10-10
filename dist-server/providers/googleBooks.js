import { getSetting } from '../settings.js';
import { fetchJson } from './shared.js';
const BASE_URL = 'https://www.googleapis.com/books/v1';
/**
 * Book cover candidates, most-reliable first.
 * 1. Google Books' own thumbnail — but force HTTPS, since it sometimes returns
 *    http:// URLs that browsers block on an https origin (mixed content).
 * 2. OpenLibrary's covers API from the book's ISBN — a keyless, stable HTTPS
 *    endpoint, used whenever Google Books has no imageLinks.
 */
function posterFor(info) {
    const direct = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    if (direct)
        return direct.replace(/^http:\/\//i, 'https://');
    const isbn = (info.industryIdentifiers ?? []).find((i) => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier;
    return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : '';
}
function normalize(item) {
    const info = item.volumeInfo ?? {};
    const photo = posterFor(info);
    const year = info.publishedDate ? info.publishedDate.substring(0, 4) : 'Unknown';
    const meta = {
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
async function apiKey() {
    const key = await getSetting('google_books_api_key');
    return key; // Google Books works without a key; optional for higher quota
}
export async function searchGoogleBooks(q) {
    const key = await apiKey();
    const url = `${BASE_URL}/volumes?q=${encodeURIComponent(q)}&maxResults=20` + (key ? `&key=${key}` : '');
    const data = await fetchJson(url);
    return (data.items ?? []).map(normalize).slice(0, 20);
}
export async function trendingGoogleBooks() {
    // No trending endpoint on Google Books — surface recently published titles.
    const key = await apiKey();
    const url = `${BASE_URL}/volumes?q=subject:fiction&orderBy=newest&maxResults=12` +
        (key ? `&key=${key}` : '');
    const data = await fetchJson(url);
    return (data.items ?? []).map(normalize).slice(0, 12);
}
//# sourceMappingURL=googleBooks.js.map