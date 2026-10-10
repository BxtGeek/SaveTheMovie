import type { MediaItem, MediaType } from '../types/media';
import MediaGrid from './MediaGrid';
import EmptyState from './EmptyState';
import { CATEGORY_LABELS } from '../types/media';

interface SearchResultsProps {
  items: MediaItem[];
  trending: MediaItem[];
  isLoading: boolean;
  trendingLoading: boolean;
  trendingError: string | null;
  onRetryTrending: () => void;
  error: string | null;
  hasSearched: boolean;
  category: MediaType;
  watchlistIds: Set<string>;
  watchedIds: Set<string>;
  onAddToWatchlist: (item: MediaItem) => void;
  onRemoveFromWatchlist: (item: MediaItem) => void;
  onMarkAsWatched: (item: MediaItem) => void;
  onMoveToWatchlist: (item: MediaItem) => void;
}

export default function SearchResults({
  items,
  trending,
  isLoading,
  trendingLoading,
  trendingError,
  onRetryTrending,
  error,
  hasSearched,
  category,
  watchlistIds,
  watchedIds,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkAsWatched,
  onMoveToWatchlist,
}: SearchResultsProps) {
  const categoryLabel = CATEGORY_LABELS[category];

  const gridProps = {
    watchlistIds,
    watchedIds,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    onMarkAsWatched,
    onMoveToWatchlist,
  };

  const skeletonGrid = (
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

  // Show trending by default
  if (!hasSearched) {
    if (trendingLoading) {
      return (
        <div>
          <h2 className="text-lg font-medium text-gray-300 mb-4">Loading...</h2>
          {skeletonGrid}
        </div>
      );
    }

    if (trending.length > 0) {
      return (
        <div>
          <h2 className="text-lg font-medium text-gray-300 mb-4">
            Trending {categoryLabel}
            <span className="ml-2 text-sm font-normal text-gray-500">
              {trending.length} {trending.length === 1 ? 'result' : 'results'}
            </span>
          </h2>
          <MediaGrid items={trending} {...gridProps} />
        </div>
      );
    }

    if (trendingError) {
      return (
        <EmptyState
          title={`Couldn't load trending ${categoryLabel}`}
          message={trendingError}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          action={
            <button
              type="button"
              onClick={onRetryTrending}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
            >
              Retry
            </button>
          }
        />
      );
    }

    return (
      <EmptyState
        title={`Discover ${categoryLabel}`}
        message={`Search for ${categoryLabel.toLowerCase()} and add them to your stash. If a category looks empty, add its API key in ⚙ Settings.`}
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Search Results</h2>
        {skeletonGrid}
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

  if (items.length === 0) {
    return (
      <EmptyState
        title="No Results"
        message={`We couldn't find any ${categoryLabel.toLowerCase()} matching your search. Try a different title.`}
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
          {items.length} {items.length === 1 ? 'result' : 'results'}
        </span>
      </h2>
      <MediaGrid items={items} {...gridProps} />
    </div>
  );
}