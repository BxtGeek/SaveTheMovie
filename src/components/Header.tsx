import type { ViewMode } from '../types/media';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  watchlistCount: number;
  watchedCount: number;
}

export default function Header({
  currentView,
  onViewChange,
  watchlistCount,
  watchedCount,
}: HeaderProps) {
  const navItems: { view: ViewMode; label: string; count?: number }[] = [
    { view: 'home', label: 'Home' },
    { view: 'watchlist', label: 'Watchlist', count: watchlistCount },
    { view: 'watched', label: 'Watched', count: watchedCount },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl">🗃️</span>
            <span className="text-base font-semibold text-primary hidden sm:inline tracking-tight">
              Stash
            </span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5">
            {navItems.map(({ view, label, count }) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === view
                    ? 'bg-white/10 text-primary'
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                }`}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            ))}

            {/* Settings icon */}
            <button
              onClick={() => onViewChange('settings')}
              className={`ml-1 p-2 rounded-md transition-colors ${
                currentView === 'settings'
                  ? 'bg-white/10 text-primary'
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`}
              aria-label="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
