#!/usr/bin/env bash
#
# Stash — quick local test runner.
#
#   ./run.sh                Run in dev mode (Vite :5173 + API :3000)
#   ./run.sh --build        Build and serve the production build (:3000)
#   ./run.sh --docker       Build & start via Docker Compose (:8080)
#   ./run.sh --no-open      Skip opening the browser
#
# If PostgreSQL is installed locally and a 'stash' database doesn't exist yet,
# the script creates it and points the app at it. Otherwise it tells you to use
# --docker. Set DATABASE_URL yourself to override the defaults.
set -euo pipefail
cd "$(dirname "$0")"

MODE="dev"
OPEN_BROWSER=1
for arg in "$@"; do
  case "$arg" in
    --build) MODE="build" ;;
    --docker) MODE="docker" ;;
    --no-open) OPEN_BROWSER=0 ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: ./run.sh [--build|--docker] [--no-open]" >&2
      exit 1
      ;;
  esac
done

# --- Validate prerequisites ---------------------------------------------------
if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)..."
  npm install
fi

# --- Local Postgres setup (macOS Homebrew / system psql) ----------------------
if [ "$MODE" != "docker" ]; then
  if command -v psql >/dev/null 2>&1; then
    DB_NAME="${STASH_DB_NAME:-stash}"
    if ! psql -lqt 2>/dev/null | cut -d'|' -f1 | grep -qw "$DB_NAME"; then
      echo "Creating local database '$DB_NAME'..."
      createdb "$DB_NAME"
    fi
    export DATABASE_URL="${DATABASE_URL:-postgres://$(whoami)@localhost:5432/$DB_NAME}"
  else
    echo "psql not found — Postgres isn't installed locally." >&2
    echo "  • Install it:  brew install postgresql@16" >&2
    echo "  • Or run with Docker:  ./run.sh --docker" >&2
    exit 1
  fi
fi

open_browser() {
  if [ "$OPEN_BROWSER" -eq 1 ] && command -v open >/dev/null 2>&1; then
    (open "$1" >/dev/null 2>&1) || true
  fi
}

case "$MODE" in
  dev)
    echo "🗃️  Stash — dev servers (Vite :5173, API :3000). Ctrl-C to stop."
    open_browser "http://localhost:5173"
    npm run dev
    ;;
  build)
    echo "Building production bundle..."
    npm run build
    echo "🗃️  Stash — serving http://localhost:3000. Ctrl-C to stop."
    open_browser "http://localhost:3000"
    node dist-server/index.js
    ;;
  docker)
    echo "🗃️  Stash — Docker Compose (app :8080, Postgres). Ctrl-C to stop."
    open_browser "http://localhost:8080"
    docker compose up --build
    ;;
esac