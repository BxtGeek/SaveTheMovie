import { getSetting } from '../settings.js';
import { fetchJson, UpstreamError } from './shared.js';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
};
function normalize(item) {
    const isTv = item.media_type === 'tv';
    const date = isTv ? item.first_air_date : item.release_date;
    const title = isTv ? item.name ?? '' : item.title ?? '';
    return {
        id: `${isTv ? 'tv' : 'movie'}:${item.id}`,
        providerId: `${isTv ? 'tv' : 'movie'}:${item.id}`,
        type: 'movie', // movies + TV share the 'movie' category
        title,
        poster: item.poster_path ? `${IMAGE_BASE_URL}/w500${item.poster_path}` : '',
        year: date ? date.substring(0, 4) : 'Unknown',
        rating: item.vote_average ?? 0,
        genres: (item.genre_ids ?? []).map((id) => genreMap[id]).filter(Boolean),
        overview: item.overview,
        meta: {},
    };
}
async function apiKey() {
    const key = await getSetting('tmdb_api_key');
    if (!key) {
        throw new UpstreamError(400, 'TMDb API key is not configured. Add it in Settings.');
    }
    return key;
}
export async function searchTmdb(query) {
    const key = await apiKey();
    const url = `${BASE_URL}/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false&page=1`;
    const data = await fetchJson(url);
    return data.results
        .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
        .map(normalize)
        .slice(0, 20);
}
export async function trendingTmdb() {
    const key = await apiKey();
    const url = `${BASE_URL}/trending/all/week?api_key=${key}&language=en-US`;
    const data = await fetchJson(url);
    return data.results
        .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
        .map(normalize)
        .slice(0, 12);
}
//# sourceMappingURL=tmdb.js.map