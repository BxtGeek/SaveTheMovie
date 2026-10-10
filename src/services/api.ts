import type {
  ApiSettings,
  Bookmark,
  BookmarkStatus,
  MediaItem,
  MediaType,
} from '../types/media';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // no JSON body — keep the generic message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function searchMedia(q: string, type: MediaType): Promise<MediaItem[]> {
  const data = await request<{ results: MediaItem[] }>(
    `/search?q=${encodeURIComponent(q)}&type=${type}`
  );
  return data.results;
}

export async function getTrending(type: MediaType): Promise<MediaItem[]> {
  const data = await request<{ results: MediaItem[] }>(`/trending?type=${type}`);
  return data.results;
}

export async function getAllBookmarks(): Promise<Bookmark[]> {
  return request<Bookmark[]>('/bookmarks');
}

export async function addBookmark(item: MediaItem, status: BookmarkStatus = 'watchlist'): Promise<void> {
  await request('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ ...item, status }),
  });
}

export async function setBookmarkStatus(item: MediaItem, status: BookmarkStatus): Promise<void> {
  await request('/bookmarks/status', {
    method: 'PATCH',
    body: JSON.stringify({ type: item.type, providerId: item.providerId, status }),
  });
}

export async function removeBookmark(item: MediaItem): Promise<void> {
  await request(
    `/bookmarks?type=${encodeURIComponent(item.type)}&providerId=${encodeURIComponent(item.providerId)}`,
    { method: 'DELETE' }
  );
}

export async function getSettings(): Promise<ApiSettings> {
  return request<ApiSettings>('/settings');
}

export async function saveSettings(
  keys: Partial<Record<'tmdb_api_key' | 'google_books_api_key' | 'jikan_api_key', string>>
): Promise<ApiSettings> {
  return request<ApiSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(keys),
  });
}

export function getPosterFallback(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a1a" width="300" height="450"/%3E%3Ctext fill="%23666" font-family="monospace" font-size="18" text-anchor="middle" x="150" y="230"%3ENo Poster%3C/text%3E%3C/svg%3E';
}