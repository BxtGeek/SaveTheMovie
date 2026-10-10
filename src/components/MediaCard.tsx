import type { MediaItem } from '../types/media';
import { getPosterFallback } from '../services/api';

interface MediaCardProps {
  item: MediaItem;
  isInWatchlist: boolean;
  isWatched: boolean;
  onAddToWatchlist: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onMarkAsWatched: (item: MediaItem) => void;
  onMoveToWatchlist: (item: MediaItem) => void;
}

const TYPE_BADGE: Record<string, string> = {
  movie: '🎬',
  anime: '📺',
  book: '📖',
};

export default function MediaCard({
  item,
  isInWatchlist,
  isWatched,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: MediaCardProps) {
  const posterSrc = item.poster || getPosterFallback();
  const metaFields = [
    item.type === 'book' && item.meta.author ? item.meta.author : null,
    item.meta.episodes ? `${item.meta.episodes} eps` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="group relative bg-surface-card rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-200">
      {/* Type badge */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
        {TYPE_BADGE[item.type]}
      </div>

      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={posterSrc}
          alt={`${item.title} cover`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPosterFallback();
          }}
        />
        {/* Rating badge */}
        {item.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-white">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm leading-tight line-clamp-1 mb-1">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>{item.year}</span>
          {item.genres.length > 0 && (
            <>
              <span className="text-gray-600">·</span>
              <span className="truncate">{item.genres[0]}</span>
            </>
          )}
        </div>
        {metaFields.length > 0 && (
          <div className="text-xs text-gray-500 mb-2 truncate">{metaFields.join(' · ')}</div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isInWatchlist ? (
            <>
              <button
                onClick={() => onRemoveFromWatchlist(item)}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-hover text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
              <button
                onClick={() => onMarkAsWatched(item)}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                ✓ Watched
              </button>
            </>
          ) : isWatched ? (
            <>
              <button
                onClick={() => onMoveToWatchlist(item)}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-hover text-gray-300 rounded-lg hover:bg-accent/20 hover:text-accent transition-colors"
              >
                Move to Watchlist
              </button>
              <button
                onClick={() => onRemoveFromWatchlist(item)}
                className="px-3 py-1.5 text-xs font-medium bg-surface-hover text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              onClick={() => onAddToWatchlist(item)}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              + Watchlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}