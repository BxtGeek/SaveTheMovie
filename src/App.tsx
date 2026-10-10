import { useState, useCallback, useEffect } from 'react';
import type { Bookmark, BookmarkStatus, MediaItem, MediaType, ViewMode } from './types/media';
import { CATEGORIES } from './types/media';
import {
  getAllBookmarks,
  getTrending,
  searchMedia,
  addBookmark,
  removeBookmark,
  setBookmarkStatus,
} from './services/api';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Watchlist from './components/Watchlist';
import WatchedList from './components/WatchedList';
import SettingsConsole from './components/SettingsConsole';
import Home, { type HomeCategory } from './components/Home';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [category, setCategory] = useState<MediaType>('movie');

  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

  const [home, setHome] = useState<Record<MediaType, HomeCategory>>(() => ({
    movie: { items: [], loading: true, error: null },
    anime: { items: [], loading: true, error: null },
    book: { items: [], loading: true, error: null },
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const allWatchlist = allBookmarks.filter((b) => b.status === 'watchlist');
  const allWatched = allBookmarks.filter((b) => b.status === 'watched');
  const watchlistIds = new Set(allWatchlist.map((m) => m.id));
  const watchedIds = new Set(allWatched.map((m) => m.id));

  useEffect(() => {
    let cancelled = false;
    getAllBookmarks()
      .then((bookmarks) => {
        if (!cancelled) setAllBookmarks(bookmarks);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load bookmarks:', err);
      })
      .finally(() => {
        if (!cancelled) setListsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadHome = useCallback(async (cats: MediaType[]) => {
    if (cats.length === 0) return;
    const settled = await Promise.allSettled(cats.map((c) => getTrending(c)));
    setHome((prev) => {
      const next = { ...prev };
      cats.forEach((c, i) => {
        const s = settled[i];
        next[c] =
          s.status === 'fulfilled'
            ? { items: s.value, loading: false, error: null }
            : {
                ...prev[c],
                loading: false,
                error: s.reason instanceof Error ? s.reason.message : 'Failed to load trending',
              };
      });
      return next;
    });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadHome(CATEGORIES));
  }, [loadHome]);

  const handleRetryHome = useCallback(
    (cat: MediaType) => {
      setHome((prev) => ({ ...prev, [cat]: { ...prev[cat], loading: true, error: null } }));
      void loadHome([cat]);
    },
    [loadHome]
  );

  const loadCategory = useCallback(
    async (signal: { cancelled: boolean }) => {
      const result = await getTrending(category).then(
        (items) => ({ ok: true as const, items }),
        (err) => ({ ok: false as const, err })
      );
      if (signal.cancelled) return;

      if (result.ok) {
        setTrending(result.items);
        setTrendingError(null);
      } else {
        setTrending([]);
        setTrendingError(
          result.err instanceof Error ? result.err.message : 'Failed to load trending'
        );
      }
      setTrendingLoading(false);
    },
    [category]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    void Promise.resolve().then(() => loadCategory(signal));
    return () => {
      signal.cancelled = true;
    };
  }, [category, loadCategory]);

  const handleRetryTrending = useCallback(() => {
    setTrendingLoading(true);
    setTrendingError(null);
    void loadCategory({ cancelled: false });
  }, [loadCategory]);

  const handleSearch = useCallback(
    async (query: string) => {
      setCurrentView((v) => (v === 'home' ? 'search' : v));
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const results = await searchMedia(query, category);
        setSearchResults(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  const upsertBookmark = useCallback((item: MediaItem, status: BookmarkStatus) => {
    setAllBookmarks((prev) => {
      const rest = prev.filter((b) => !(b.type === item.type && b.providerId === item.providerId));
      return [...rest, { ...item, status }];
    });
  }, []);

  const removeStoredBookmark = useCallback((item: MediaItem) => {
    setAllBookmarks((prev) =>
      prev.filter((b) => !(b.type === item.type && b.providerId === item.providerId))
    );
  }, []);

  const handleAddToWatchlist = useCallback(
    (item: MediaItem) => {
      addBookmark(item, 'watchlist')
        .then(() => upsertBookmark(item, 'watchlist'))
        .catch((err) => console.error('Failed to add to watchlist:', err));
    },
    [upsertBookmark]
  );

  const handleRemoveFromWatchlist = useCallback(
    (item: MediaItem) => {
      removeBookmark(item)
        .then(() => removeStoredBookmark(item))
        .catch((err) => console.error('Failed to remove bookmark:', err));
    },
    [removeStoredBookmark]
  );

  const handleMarkAsWatched = useCallback(
    (item: MediaItem) => {
      setBookmarkStatus(item, 'watched')
        .then(() => upsertBookmark(item, 'watched'))
        .catch((err) => console.error('Failed to mark as watched:', err));
    },
    [upsertBookmark]
  );

  const handleMoveToWatchlist = useCallback(
    (item: MediaItem) => {
      setBookmarkStatus(item, 'watchlist')
        .then(() => upsertBookmark(item, 'watchlist'))
        .catch((err) => console.error('Failed to move to watchlist:', err));
    },
    [upsertBookmark]
  );

  const handleCategoryChange = useCallback((next: MediaType) => {
    setCategory(next);
    setCurrentView('search');
    setHasSearched(false);
    setSearchResults([]);
    setError(null);
    setTrendingLoading(true);
    setTrendingError(null);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        watchlistCount={allWatchlist.length}
        watchedCount={allWatched.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar — visible on all views except settings */}
        {currentView !== 'settings' && (
          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              category={category}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        )}

        {/* Content */}
        <div>
          {currentView === 'home' && (
            <Home
              home={home}
              onRetry={handleRetryHome}
              onBrowse={handleCategoryChange}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onMarkAsWatched={handleMarkAsWatched}
              onMoveToWatchlist={handleMoveToWatchlist}
            />
          )}

          {currentView === 'search' && (
            <SearchResults
              items={searchResults}
              trending={trending}
              isLoading={isLoading}
              trendingLoading={trendingLoading}
              trendingError={trendingError}
              onRetryTrending={handleRetryTrending}
              error={error}
              hasSearched={hasSearched}
              category={category}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onMarkAsWatched={handleMarkAsWatched}
              onMoveToWatchlist={handleMoveToWatchlist}
            />
          )}

          {currentView === 'watchlist' && listsLoading ? (
            <div className="grid place-items-center py-16">
              <div className="w-6 h-6 border-2 border-secondary/40 border-t-accent rounded-full animate-spin" />
            </div>
          ) : currentView === 'watchlist' ? (
            <Watchlist
              movies={allWatchlist}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onMarkAsWatched={handleMarkAsWatched}
            />
          ) : null}

          {currentView === 'watched' && listsLoading ? (
            <div className="grid place-items-center py-16">
              <div className="w-6 h-6 border-2 border-secondary/40 border-t-accent rounded-full animate-spin" />
            </div>
          ) : currentView === 'watched' ? (
            <WatchedList
              movies={allWatched}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onMoveToWatchlist={handleMoveToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
            />
          ) : null}

          {currentView === 'settings' && <SettingsConsole />}
        </div>
      </main>

      <footer className="border-t border-border py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-secondary/60">
          Stash — React · TypeScript · Express · PostgreSQL
        </div>
      </footer>
    </div>
  );
}

export default App;
