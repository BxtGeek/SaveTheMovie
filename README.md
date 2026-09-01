# 🎬 SaveTheMovie

A minimal, modern movie bookmarking web application built with React, TypeScript, and Tailwind CSS.

## Features

- **Search** — Find movies by title using the TMDb API (or sample data)
- **Trending** — See trending movies on the homepage
- **Watchlist** — Save movies you want to watch
- **Watched** — Track movies you've already seen
- **Persistent** — Your lists are saved to localStorage
- **Fira Code Font** — Beautiful monospace Nerd Font

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- TMDb API (with sample data fallback)
- Docker ready
- GitHub Pages deployment

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

## Docker

```bash
# Build the Docker image
docker build -t savethemovie .

# Run the container
docker run -p 8080:80 savethemovie

# Access at http://localhost:8080
```

## GitHub Pages Deployment

The app automatically deploys to GitHub Pages on push to `main` branch.

### Setup:

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Add your TMDb API key to Settings → Secrets → Actions:
   - Name: `VITE_TMDB_API_KEY`
   - Value: Your TMDb API key

Your app will be live at: `https://bxtgeek.github.io/SaveTheMovie/`

## Build

```bash
npm run build
npm run preview
```

## Repository

https://github.com/BxtGeek/SaveTheMovie
