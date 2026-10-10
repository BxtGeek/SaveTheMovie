import { fetchJson, UpstreamError } from './shared.js';
/**
 * Keyless fallback provider for anime. Jikan can go down, and the official MAL
 * API needs a Client ID — Kitsu works with no key at all, so the Anime tab keeps
 * functioning out of the box. Categories come via JSON:API `include` so cards get
 * genres too.
 */
const BASE_URL = 'https://kitsu.io/api/edge';
/** Kitsu is our last-resort anime provider — give it one free retry on failure. */
async function fetchKitsu(url) {
    try {
        return await fetchJson(url);
    }
    catch {
        await new Promise((r) => setTimeout(r, 700));
        return fetchJson(url);
    }
}
function categoryMap(res) {
    const map = new Map();
    for (const cat of res.included ?? []) {
        if (cat.attributes?.title)
            map.set(cat.id, cat.attributes.title);
    }
    return map;
}
/** JSON:API error docs (HTTP 200 + an `errors` key) have no `data` — fail cleanly. */
function itemsOf(res) {
    if (Array.isArray(res.data))
        return res.data;
    const detail = res.errors?.[0]?.detail;
    throw new UpstreamError(502, `Kitsu API unavailable${detail ? `: ${detail}` : ''}`);
}
function normalize(item, cats) {
    const attrs = item.attributes ?? {};
    const genreIds = item.relationships?.categories?.data?.map((d) => d.id) ?? [];
    return {
        id: `anime:${item.id}`,
        providerId: `anime:${item.id}`,
        type: 'anime',
        title: attrs.canonicalTitle ?? attrs.titles?.en ?? 'Untitled',
        poster: attrs.posterImage?.medium ?? '',
        year: attrs.startDate ? attrs.startDate.substring(0, 4) : 'Unknown',
        rating: attrs.averageRating ? Number(attrs.averageRating) / 10 : 0,
        genres: genreIds
            .map((id) => cats.get(id))
            .filter((name) => Boolean(name))
            .slice(0, 5),
        overview: attrs.synopsis,
        meta: { episodes: attrs.episodeCount ?? undefined },
    };
}
export async function searchKitsu(q) {
    const url = `${BASE_URL}/anime?page[limit]=20&filter[text]=${encodeURIComponent(q)}&include=categories`;
    const data = await fetchKitsu(url);
    const cats = categoryMap(data);
    return itemsOf(data).map((d) => normalize(d, cats)).slice(0, 20);
}
/** Error-doc or missing response in a merge candidate → skip it, don't fail the feed. */
function safeItems(res) {
    if (!res || !Array.isArray(res.data))
        return [];
    return res.data;
}
export async function trendingKitsu() {
    // Kitsu caps /trending at 10, so merge it with the most-popular feed to hit
    // the same 12 items the other categories show. One hop failing won't sink the
    // feed — the surviving source still renders.
    const [trendingRes, popularRes] = await Promise.all([
        fetchKitsu(`${BASE_URL}/trending/anime?page[limit]=12&include=categories`).catch(() => null),
        fetchKitsu(`${BASE_URL}/anime?page[limit]=12&sort=-user_count&include=categories`).catch(() => null),
    ]);
    const cats = new Map([
        ...categoryMap(trendingRes ?? {}),
        ...categoryMap(popularRes ?? {}),
    ]);
    const seen = new Set();
    const out = [];
    for (const res of [trendingRes, popularRes]) {
        for (const item of safeItems(res)) {
            const media = normalize(item, cats);
            if (!seen.has(media.id)) {
                seen.add(media.id);
                out.push(media);
            }
        }
    }
    return out.slice(0, 12);
}
//# sourceMappingURL=kitsu.js.map