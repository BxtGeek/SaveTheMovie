import type { MediaItem, MediaType } from '../types/media';
import { CATEGORIES } from '../types/media';
import MediaGrid from './MediaGrid';

export interface HomeCategory {
  items: MediaItem[];
  loading: boolean;
  error: string | null;
}

const SECTION_TITLES: Record<MediaType, string> = {
  movie: 'Trending Movies & TV',
  anime: 'Top Anime',
  book: 'Trending Books',
};

interface HomeProps {
  home: Record<MediaType, HomeCategory>;
  onRetry: (category: MediaType) => void;
  onBrowse: (category: MediaType) => void;
  watchlistIds: Set<string>;
  watchedIds: Set<string>;
  onAddToWatchlist: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onMarkAsWatched: (item: MediaItem) => void;
  onMoveToWatchlist: (item: MediaItem) => void;
}

function SkeletonGrid() {
  return (
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
  );
}

export default function Home({
  home,
  onRetry,
  onBrowse,
  watchlistIds,
  watchedIds,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: HomeProps) {
  const gridProps = {
    watchlistIds,
    watchedIds,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    onMarkAsWatched,
    onMoveToWatchlist,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Your Stash</h1>
        <p className="text-sm text-gray-400 mt-1">
          Top picks across movies &amp; TV, anime, and books — save anything to your watchlist and binge later.
        </p>
      </div>

      <div className="space-y-10">
        {CATEGORIES.map((cat) => {
          const { items, loading, error } = home[cat];
          return (
            <section key={cat}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-300">{SECTION_TITLES[cat]}</h2>
                <button
                  type="button"
                  onClick={() => onBrowse(cat)}
                  className="text-sm text-accent hover:underline"
                >
                  Browse {cat === 'movie' ? 'Movies & TV' : cat === 'anime' ? 'Anime' : 'Books'} →
                </button>
              </div>

              {loading ? (
                <SkeletonGrid />
              ) : error && items.length === 0 ? (
                <div className="flex items-center justify-between gap-4 p-4 bg-surface-card border border-white/10 rounded-xl">
                  <div className="text-sm text-gray-400">
                    <span className="block font-medium text-gray-300">Couldn't load trending {cat === 'movie' ? 'Movies & TV' : cat === 'anime' ? 'Anime' : 'Books'}</span>
                    <span className="mt-1 block text-xs text-gray-500">{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRetry(cat)}
                    className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <MediaGrid items={items} {...gridProps} />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}