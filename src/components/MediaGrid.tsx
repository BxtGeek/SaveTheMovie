import type { MediaItem } from '../types/media';
import MediaCard from './MediaCard';

interface MediaGridProps {
  items: MediaItem[];
  watchlistIds: Set<string>;
  watchedIds: Set<string>;
  onAddToWatchlist: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onMarkAsWatched: (item: MediaItem) => void;
  onMoveToWatchlist: (item: MediaItem) => void;
}

export default function MediaGrid({
  items,
  watchlistIds,
  watchedIds,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          isInWatchlist={watchlistIds.has(item.id)}
          isWatched={watchedIds.has(item.id)}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
          onMarkAsWatched={onMarkAsWatched}
          onMoveToWatchlist={onMoveToWatchlist}
        />
      ))}
    </div>
  );
}