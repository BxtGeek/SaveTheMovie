import type { MediaItem } from '../types/media';
import { CATEGORIES } from '../types/media';
import MediaGrid from './MediaGrid';
import EmptyState from './EmptyState';

interface WatchlistProps {
  movies: MediaItem[];
  watchlistIds: Set<string>;
  watchedIds: Set<string>;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onMarkAsWatched: (item: MediaItem) => void;
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
        message="Search for media to get started, then add it to your watchlist."
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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
        My Watchlist
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
              onMarkAsWatched={onMarkAsWatched}
              onMoveToWatchlist={() => {}}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
