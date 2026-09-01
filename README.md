# 🎬 SaveTheMovie

A minimal, modern movie bookmarking web application built with React, TypeScript, and Tailwind CSS.

## Features

- **Search** — Find movies by title using the TMDb API (or sample data)
- **Watchlist** — Save movies you want to watch
- **Watched** — Track movies you've already seen
- **Persistent** — Your lists are saved to localStorage

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- TMDb API (with sample data fallback)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## API Key (Optional)

The app works without an API key using sample movie data. To use real movie data:

1. Get a free API key at [TMDb](https://www.themoviedb.org/settings/api)
2. Copy `.env.example` to `.env.local`
3. Add your API key:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   ```

## Build

```bash
npm run build
npm run preview
```
