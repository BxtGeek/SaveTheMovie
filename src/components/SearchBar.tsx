import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import type { MediaItem, MediaType } from '../types/media';
import { CATEGORIES, CATEGORY_LABELS } from '../types/media';
import { searchMedia, getPosterFallback } from '../services/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  category: MediaType;
  onCategoryChange: (category: MediaType) => void;
}

const SUBMIT_DELAY = 400;
const SUGGEST_DELAY = 200;
const MIN_QUERY_LENGTH = 2;

export default function SearchBar({ onSearch, isLoading, category, onCategoryChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Live-search: commit the debounced query to the results grid.
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const q = query.trim();
      if (q && q !== lastSubmitted.current) {
        lastSubmitted.current = q;
        onSearch(q);
      }
    }, SUBMIT_DELAY);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, onSearch]);

  // Predictions: fetch top matches for the current query/category.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return;

    const timer = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const matches = await searchMedia(q, category);
        if (matches.length > 0) {
          setSuggestions(matches.slice(0, 6));
          setSuggestOpen(true);
          setActiveIndex(-1);
        } else {
          setSuggestions([]);
          setSuggestOpen(false);
        }
      } catch {
        setSuggestions([]);
        setSuggestOpen(false);
      } finally {
        setSuggestLoading(false);
      }
    }, SUGGEST_DELAY);

    return () => clearTimeout(timer);
  }, [query, category]);

  const commit = (value: string) => {
    setQuery(value);
    lastSubmitted.current = value;
    setSuggestOpen(false);
    setActiveIndex(-1);
    onSearch(value);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      commit(suggestions[activeIndex].title);
    } else if (e.key === 'Escape') {
      setSuggestOpen(false);
    }
  };

  const CATEGORY_ICONS: Record<MediaType, string> = {
    movie: '🎬',
    anime: '📺',
    book: '📖',
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* Category pills */}
      <div className="flex items-center justify-center gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              category === cat
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'bg-surface-card text-secondary border border-border hover:text-primary hover:border-white/10'
            }`}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading || suggestLoading ? (
            <div className="w-4 h-4 border-2 border-secondary/40 border-t-accent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={suggestOpen}
          aria-controls="search-suggestions"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setSuggestOpen(true);
          }}
          onBlur={() => setSuggestOpen(false)}
          placeholder={`Search ${CATEGORY_LABELS[category].toLowerCase()}...`}
          className="w-full pl-11 pr-10 py-2.5 bg-surface-card border border-border rounded-lg text-primary placeholder-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-sm"
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Predictions dropdown */}
        {suggestOpen && suggestions.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute top-full mt-1.5 w-full bg-surface-card border border-border rounded-lg shadow-2xl shadow-black/40 z-20 overflow-hidden py-0.5"
          >
            {suggestions.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(item.title);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    i === activeIndex ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                  }`}
                >
                  <img
                    src={item.poster || getPosterFallback()}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getPosterFallback();
                    }}
                    className="w-7 h-10 object-cover rounded shrink-0 bg-surface-hover"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-primary truncate">{item.title}</span>
                    <span className="block text-xs text-secondary">
                      {item.year}
                      {item.genres[0] ? ` · ${item.genres[0]}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
