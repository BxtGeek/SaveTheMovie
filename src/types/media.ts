export type MediaType = 'movie' | 'anime' | 'book';

export interface MediaItem {
  id: string;
  providerId: string;
  type: MediaType;
  title: string;
  poster: string;
  year: string;
  rating: number;
  genres: string[];
  overview?: string;
  meta: Record<string, string | number | undefined>;
}

export type BookmarkStatus = 'watchlist' | 'watched';

export interface Bookmark extends MediaItem {
  status: BookmarkStatus;
}

export interface ApiKeyStatus {
  configured: boolean;
  masked: string;
}

export interface ApiSettings {
  tmdb_api_key: ApiKeyStatus;
  google_books_api_key: ApiKeyStatus;
  jikan_api_key: ApiKeyStatus;
}

export type ViewMode = 'home' | 'search' | 'watchlist' | 'watched' | 'settings';

export const CATEGORY_LABELS: Record<MediaType, string> = {
  movie: 'Movies & TV',
  anime: 'Anime',
  book: 'Books',
};

export const CATEGORIES: MediaType[] = ['movie', 'anime', 'book'];