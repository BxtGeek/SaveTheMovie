import { useState, useCallback, useEffect } from 'react';
import type { Movie, ViewMode } from './types/movie';
import { searchMovies, getTrendingMovies } from './services/tmdbApi';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Watchlist from './components/Watchlist';
import WatchedList from './components/WatchedList';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('movieBookmarkWatchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [watched, setWatched] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('movieBookmarkWatched');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch trending movies on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await getTrendingMovies();
        setTrendingMovies(trending);
      } catch (err) {
        console.error('Failed to fetch trending:', err);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('movieBookmarkWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('movieBookmarkWatched', JSON.stringify(watched));
  }, [watched]);

  // Create lookup sets for O(1) checks
  const watchlistIds = new Set(watchlist.map((m) => m.id));
  const watchedIds = new Set(watched.map((m) => m.id));

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchMovies(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add to watchlist
  const handleAddToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
    // Remove from watched if present
    setWatched((prev) => prev.filter((m) => m.id !== movie.id));
  }, []);

  // Remove from watchlist
  const handleRemoveFromWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
  }, []);

  // Mark as watched (from search or watchlist)
  const handleMarkAsWatched = useCallback(
    (movie: Movie) => {
      setWatched((prev) => {
        if (prev.some((m) => m.id === movie.id)) return prev;
        return [...prev, movie];
      });
      // Remove from watchlist if present
      setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
    },
    []
  );

  // Move back to watchlist (from watched)
  const handleMoveToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
    setWatched((prev) => prev.filter((m) => m.id !== movie.id));
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        watchlistCount={watchlist.length}
        watchedCount={watched.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar - always visible */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Content */}
        <div className="mt-8">
          {currentView === 'search' && (
            <SearchResults
              movies={searchResults}
              trendingMovies={trendingMovies}
              isLoading={isLoading}
              trendingLoading={trendingLoading}
              error={error}
              hasSearched={hasSearched}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onMarkAsWatched={handleMarkAsWatched}
              onMoveToWatchlist={handleMoveToWatchlist}
            />
          )}

          {currentView === 'watchlist' && (
            <Watchlist
              movies={watchlist}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onMarkAsWatched={handleMarkAsWatched}
            />
          )}

          {currentView === 'watched' && (
            <WatchedList
              movies={watched}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onMoveToWatchlist={handleMoveToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          SaveTheMovie — Built with React, TypeScript & Tailwind CSS
        </div>
      </footer>
    </div>
  );
}

export default App;
