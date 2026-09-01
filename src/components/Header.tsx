import type { ViewMode } from '../types/movie';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  watchlistCount: number;
  watchedCount: number;
}

export default function Header({ currentView, onViewChange, watchlistCount, watchedCount }: HeaderProps) {
  const navItems: { view: ViewMode; label: string; count?: number }[] = [
    { view: 'search', label: 'Search' },
    { view: 'watchlist', label: 'Watchlist', count: watchlistCount },
    { view: 'watched', label: 'Watched', count: watchedCount },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - clickable to go to search */}
          <button
            onClick={() => onViewChange('search')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🎬</span>
            <span className="text-lg font-semibold text-white hidden sm:inline">
              SaveTheMovie
            </span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ view, label, count }) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === view
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-accent text-white rounded-full px-1">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
