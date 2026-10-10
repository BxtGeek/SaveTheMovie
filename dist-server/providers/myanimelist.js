import { fetchJson } from './shared.js';
/**
 * Official MyAnimeList v2 API (keyless style). Search and ranking work with just
 * a free Client ID (myanimelist.net/apiconfig) sent as X-MAL-CLIENT-ID — no OAuth
 * needed for these endpoints. Used as a fallback when Jikan is down: we store the
 * Client ID in the `jikan_api_key` setting.
 */
const BASE_URL = 'https://api.myanimelist.net/v2';
const FIELDS = 'genres,num_episodes,start_date,mean,synopsis';
function normalize(node) {
    return {
        id: `anime:${node.id}`,
        providerId: `anime:${node.id}`,
        type: 'anime',
        title: node.title,
        poster: node.main_picture?.medium ?? '',
        year: node.start_date ? node.start_date.substring(0, 4) : 'Unknown',
        rating: node.mean ?? 0,
        genres: (node.genres ?? []).map((g) => g.name),
        overview: node.synopsis,
        meta: { episodes: node.num_episodes },
    };
}
async function fetchMal(path, clientId) {
    return fetchJson(`${BASE_URL}${path}`, {
        headers: { 'X-MAL-CLIENT-ID': clientId },
    });
}
export async function searchMal(q, clientId) {
    const path = `/anime?q=${encodeURIComponent(q)}&limit=20&fields=${FIELDS}`;
    const data = await fetchMal(path, clientId);
    return data.data.map((d) => normalize(d.node)).slice(0, 20);
}
export async function trendingMal(clientId) {
    const path = `/anime/ranking?ranking_type=all&limit=12&fields=${FIELDS}`;
    const data = await fetchMal(path, clientId);
    return data.data.map((d) => normalize(d.node)).slice(0, 12);
}
//# sourceMappingURL=myanimelist.js.map