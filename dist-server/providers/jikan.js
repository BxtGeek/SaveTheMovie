import { getSetting } from '../settings.js';
import { fetchJikanJson, UpstreamError } from './shared.js';
import { searchMal, trendingMal } from './myanimelist.js';
import { searchKitsu, trendingKitsu } from './kitsu.js';
const BASE_URL = 'https://api.jikan.moe/v4';
function normalize(item) {
    const poster = item.images?.jpg?.image_url ?? '';
    const year = item.start_date ? item.start_date.substring(0, 4) : 'Unknown';
    const genres = (item.genres ?? [])
        .map((g) => g.name)
        .filter((name) => Boolean(name));
    return {
        id: `anime:${item.mal_id}`,
        providerId: `anime:${item.mal_id}`,
        type: 'anime',
        title: item.title,
        poster,
        year,
        rating: item.score ?? 0,
        genres,
        overview: item.synopsis,
        meta: {},
    };
}
/**
 * Chain of anime providers, most-preferred first: Jikan → official MyAnimeList
 * (only if a Client ID is configured in Settings) → keyless Kitsu. Each fallback
 * is tried only if the ones before it failed, so anime keeps working even while
 * Jikan's backend is down and no MAL key exists.
 */
async function withFallbacks(primary, viaMal, viaKitsu) {
    let lastErr;
    try {
        return await primary();
    }
    catch (err) {
        lastErr = err;
    }
    const clientId = await getSetting('jikan_api_key');
    if (clientId) {
        try {
            return await viaMal(clientId);
        }
        catch (err) {
            lastErr = err;
        }
    }
    try {
        return await viaKitsu();
    }
    catch (err) {
        lastErr = err;
    }
    const detail = lastErr instanceof Error ? lastErr.message : 'unknown error';
    throw new UpstreamError(lastErr instanceof UpstreamError ? lastErr.status : 502, `Anime providers are currently unreachable (${detail}). Try again later, or add a free MyAnimeList Client ID in ⚙ Settings.`);
}
export function searchJikan(q) {
    const primary = async () => {
        const url = `${BASE_URL}/anime?q=${encodeURIComponent(q)}&limit=20&sfw=true`;
        const data = await fetchJikanJson(url);
        return data.data.map(normalize).slice(0, 20);
    };
    return withFallbacks(primary, (clientId) => searchMal(q, clientId), () => searchKitsu(q));
}
export function trendingJikan() {
    const primary = async () => {
        const url = `${BASE_URL}/top/anime?limit=12&sfw=true`;
        const data = await fetchJikanJson(url);
        return data.data.map(normalize).slice(0, 12);
    };
    return withFallbacks(primary, (clientId) => trendingMal(clientId), trendingKitsu);
}
//# sourceMappingURL=jikan.js.map