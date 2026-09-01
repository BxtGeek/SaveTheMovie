import type { Movie } from '../types/movie';
import MovieGrid from './MovieGrid';
import EmptyState from './EmptyState';

interface WatchedListProps {
  movies: Movie[];
  watchlistIds: Set<number>;
  watchedIds: Set<number>;
  onMoveToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (movie: Movie) => void;
}

export default function WatchedList({
  movies,
  watchlistIds,
  watchedIds,
  onMoveToWatchlist,
  onRemoveFromWatchlist,
}: WatchedListProps) {
  if (movies.length === 0) {
    return (
      <EmptyState
        title="No Watched Movies"
        message="When you finish watching a movie, mark it as watched to keep track."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-300 mb-4">
        Watched Movies
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
        onMarkAsWatched={() => {}}
        onMoveToWatchlist={onMoveToWatchlist}
      />
    </div>
  );
}
