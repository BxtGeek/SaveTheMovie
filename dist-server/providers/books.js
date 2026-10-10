import { UpstreamError } from './shared.js';
import { searchGoogleBooks, trendingGoogleBooks } from './googleBooks.js';
import { searchOpenLibrary, trendingOpenLibrary } from './openLibrary.js';
/**
 * Book provider entry points. Google Books is primary; when it fails (most
 * commonly the anonymous "Queries per day" quota, HTTP 429, or an outage) we
 * fall back to keyless OpenLibrary so the Books tab keeps working out of the
 * box. Adding a Google Books API key in Settings still gets you the primary
 * source.
 */
async function withFallback(primary, fallback) {
    try {
        return await primary();
    }
    catch (err) {
        if (err instanceof UpstreamError && err.status >= 400) {
            return fallback();
        }
        throw err;
    }
}
export function searchBooks(q) {
    return withFallback(() => searchGoogleBooks(q), () => searchOpenLibrary(q));
}
export function trendingBooks() {
    return withFallback(trendingGoogleBooks, trendingOpenLibrary);
}
//# sourceMappingURL=books.js.map