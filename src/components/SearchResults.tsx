import type { Movie } from '../types/movie';
import MovieGrid from './MovieGrid';
import EmptyState from './EmptyState';

interface SearchResultsProps {
  movies: Movie[];
  trendingMovies: Movie[];
  isLoading: boolean;
  trendingLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  watchlistIds: Set<number>;
  watchedIds: Set<number>;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (movie: Movie) => void;
  onMarkAsWatched: (movie: Movie) => void;
  onMoveToWatchlist: (movie: Movie) => void;
}

export default function SearchResults({
  movies,
  trendingMovies,
  isLoading,
  trendingLoading,
  error,
  hasSearched,
  watchlistIds,
  watchedIds,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: SearchResultsProps) {
  // Show trending movies by default
  if (!hasSearched) {
    if (trendingLoading) {
      return (
        <div>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-card rounded-xl overflow-hidden border border-white/5 animate-pulse">
                <div className="aspect-[2/3] bg-surface-hover" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-surface-hover rounded w-3/4" />
                  <div className="h-3 bg-surface-hover rounded w-1/2" />
                  <div className="h-8 bg-surface-hover rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (trendingMovies.length > 0) {
      return (
        <div>
          <h2 className="text-lg font-medium text-gray-300 mb-4">
            Trending Now
            <span className="ml-2 text-sm font-normal text-gray-500">
              {trendingMovies.length} {trendingMovies.length === 1 ? 'movie' : 'movies'}
            </span>
          </h2>
          <MovieGrid
            movies={trendingMovies}
            watchlistIds={watchlistIds}
            watchedIds={watchedIds}
            onAddToWatchlist={onAddToWatchlist}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
            onMarkAsWatched={onMarkAsWatched}
            onMoveToWatchlist={onMoveToWatchlist}
          />
        </div>
      );
    }

    return (
      <EmptyState
        title="Discover Movies"
        message="Search for your favorite movies and add them to your watchlist."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        }
      />
    );
  }
  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Search Results</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-card rounded-xl overflow-hidden border border-white/5 animate-pulse">
              <div className="aspect-[2/3] bg-surface-hover" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-surface-hover rounded w-3/4" />
                <div className="h-3 bg-surface-hover rounded w-1/2" />
                <div className="h-8 bg-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Something went wrong"
        message={error}
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    );
  }

  if (!hasSearched) {
    return (
      <EmptyState
        title="Discover Movies"
        message="Search for your favorite movies and add them to your watchlist."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        }
      />
    );
  }

  if (movies.length === 0) {
    return (
      <EmptyState
        title="No Results"
        message="We couldn't find any movies matching your search. Try a different title."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-300 mb-4">
        Search Results
        <span className="ml-2 text-sm font-normal text-gray-500">
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
        </span>
      </h2>
      <MovieGrid
        movies={movies}
        watchlistIds={watchlistIds}
        watchedIds={watchedIds}
        onAddToWatchlist={onAddToWatchlist}
        onRemoveFromWatchlist={onRemoveFromWatchlist}
        onMarkAsWatched={onMarkAsWatched}
        onMoveToWatchlist={onMoveToWatchlist}
      />
    </div>
  );
}
