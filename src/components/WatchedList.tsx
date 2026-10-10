import type { MediaItem } from '../types/media';
import { CATEGORIES } from '../types/media';
import MediaGrid from './MediaGrid';
import EmptyState from './EmptyState';

interface WatchedListProps {
  movies: MediaItem[];
  watchlistIds: Set<string>;
  watchedIds: Set<string>;
  onMoveToWatchlist: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
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
        title="No Watched Items"
        message="When you finish watching/reading something, mark it as watched to keep track."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  const grouped = CATEGORIES
    .map((cat) => ({ cat, items: movies.filter((m) => m.type === cat) }))
    .filter(({ items }) => items.length > 0);

  return (
    <div>
      <h2 className="text-lg font-medium text-primary mb-1">
        Watched
        <span className="ml-2 text-sm font-normal text-secondary">
          {movies.length} {movies.length === 1 ? 'item' : 'items'}
        </span>
      </h2>

      <div className="mt-6 space-y-8">
        {grouped.map(({ cat, items }) => (
          <section key={cat} className="mb-8 last:mb-0">
            <MediaGrid
              items={items}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onAddToWatchlist={() => {}}
              onRemoveFromWatchlist={onRemoveFromWatchlist}
              onMarkAsWatched={() => {}}
              onMoveToWatchlist={onMoveToWatchlist}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
