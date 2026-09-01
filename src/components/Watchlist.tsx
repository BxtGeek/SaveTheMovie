import type { Movie } from '../types/movie';
import MovieGrid from './MovieGrid';
import EmptyState from './EmptyState';

interface WatchlistProps {
  movies: Movie[];
  watchlistIds: Set<number>;
  watchedIds: Set<number>;
  onRemoveFromWatchlist: (movie: Movie) => void;
  onMarkAsWatched: (movie: Movie) => void;
}

export default function Watchlist({
  movies,
  watchlistIds,
  watchedIds,
  onRemoveFromWatchlist,
  onMarkAsWatched,
}: WatchlistProps) {
  if (movies.length === 0) {
    return (
      <EmptyState
        title="Your Watchlist is Empty"
        message="Search for a movie to get started, then add it to your watchlist."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        }
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-300 mb-4">
        My Watchlist
        <span className="ml-2 text-sm font-normal text-gray-500">
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
        </span>
      </h2>
      <MovieGrid
        movies={movies}
        watchlistIds={watchlistIds}
        watchedIds={watchedIds}
        onAddToWatchlist={() => {}}
        onRemoveFromWatchlist={onRemoveFromWatchlist}
        onMarkAsWatched={onMarkAsWatched}
        onMoveToWatchlist={() => {}}
      />
    </div>
  );
}
