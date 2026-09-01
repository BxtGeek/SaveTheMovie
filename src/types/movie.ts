export interface Movie {
  id: number;
  title: string;
  poster: string;
  year: string;
  rating: number;
  genres: string[];
  overview?: string;
}

export interface MovieState {
  watchlist: Movie[];
  watched: Movie[];
}

export type ViewMode = 'search' | 'watchlist' | 'watched';
