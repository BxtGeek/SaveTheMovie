import type { Movie } from '../types/movie';
import { getPosterFallback } from '../services/tmdbApi';

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  isWatched: boolean;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (movie: Movie) => void;
  onMarkAsWatched: (movie: Movie) => void;
  onMoveToWatchlist: (movie: Movie) => void;
}

export default function MovieCard({
  movie,
  isInWatchlist,
  isWatched,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: MovieCardProps) {
  const posterSrc = movie.poster || getPosterFallback();

  return (
    <div className="group relative bg-surface-card rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-200">
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={posterSrc}
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPosterFallback();
          }}
        />
        {/* Rating badge */}
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-white">{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm leading-tight line-clamp-1 mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>{movie.year}</span>
          {movie.genres.length > 0 && (
            <>
              <span className="text-gray-600">·</span>
              <span className="truncate">{movie.genres[0]}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isInWatchlist ? (
            <button
              onClick={() => onRemoveFromWatchlist(movie)}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-hover text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          ) : isWatched ? (
            <button
              onClick={() => onMoveToWatchlist(movie)}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-hover text-gray-300 rounded-lg hover:bg-accent/20 hover:text-accent transition-colors"
            >
              Rewatch
            </button>
          ) : (
            <button
              onClick={() => onAddToWatchlist(movie)}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              + Watchlist
            </button>
          )}

          {!isWatched && (
            <button
              onClick={() => onMarkAsWatched(movie)}
              disabled={isInWatchlist}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isInWatchlist
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-surface-hover text-gray-300 hover:bg-green-500/20 hover:text-green-400'
              }`}
            >
              {isInWatchlist ? '✓ Watched' : 'Watched'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
