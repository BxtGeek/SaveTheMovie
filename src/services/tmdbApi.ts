import type { Movie } from '../types/movie';
import { sampleMovies } from '../data/sampleMovies';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  overview?: string;
}

interface TmdbSearchResponse {
  results: TmdbMovie[];
  total_results: number;
}

const genreMap: Record<number, string> = {
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

function tmdbMovieToMovie(tmdbMovie: TmdbMovie): Movie {
  const year = tmdbMovie.release_date
    ? tmdbMovie.release_date.substring(0, 4)
    : 'Unknown';

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    poster: tmdbMovie.poster_path
      ? `${IMAGE_BASE_URL}/w500${tmdbMovie.poster_path}`
      : '',
    year,
    rating: tmdbMovie.vote_average,
    genres: tmdbMovie.genre_ids
      .map((id) => genreMap[id])
      .filter(Boolean),
  };
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!API_KEY) {
    // Use sample data filtered by query
    const lowerQuery = query.toLowerCase();
    return sampleMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.genres.some((g) => g.toLowerCase().includes(lowerQuery))
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data: TmdbSearchResponse = await response.json();
    return data.results.map(tmdbMovieToMovie);
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to sample data
    const lowerQuery = query.toLowerCase();
    return sampleMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.genres.some((g) => g.toLowerCase().includes(lowerQuery))
    );
  }
}

export async function getTrendingMovies(): Promise<Movie[]> {
  if (!API_KEY) {
    // Return curated trending sample (recent/popular movies)
    return sampleMovies.filter(m => m.year >= '2020').slice(0, 6);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending movies');
    }

    const data: { results: TmdbMovie[] } = await response.json();
    return data.results.slice(0, 6).map(tmdbMovieToMovie);
  } catch (error) {
    console.error('Trending API Error:', error);
    // Fallback to recent sample movies
    return sampleMovies.filter(m => m.year >= '2020').slice(0, 6);
  }
}

export function getPosterFallback(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a1a" width="300" height="450"/%3E%3Ctext fill="%23666" font-family="monospace" font-size="18" text-anchor="middle" x="150" y="230"%3ENo Poster%3C/text%3E%3C/svg%3E';
}
