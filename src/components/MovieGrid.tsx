import type { Movie } from '../types/movie';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  watchlistIds: Set<number>;
  watchedIds: Set<number>;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (movie: Movie) => void;
  onMarkAsWatched: (movie: Movie) => void;
  onMoveToWatchlist: (movie: Movie) => void;
}

export default function MovieGrid({
  movies,
  watchlistIds,
  watchedIds,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isInWatchlist={watchlistIds.has(movie.id)}
          isWatched={watchedIds.has(movie.id)}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
          onMarkAsWatched={onMarkAsWatched}
          onMoveToWatchlist={onMoveToWatchlist}
        />
      ))}
    </div>
  );
}
