import https from 'node:https';

/** Shared normalized shape returned by every provider — mirrors src/types/media.ts. */
export type MediaType = 'movie' | 'anime' | 'book';

export interface MediaItem {
  id: string;
  providerId: string;
  type: MediaType;
  title: string;
  poster: string;
  year: string;
  rating: number;
  genres: string[];
  overview?: string;
  meta: Record<string, string | number | undefined>;
}

export class UpstreamError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** fetch + JSON with status-aware errors for provider calls. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const timeout = AbortSignal.timeout(20_000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;

  const res = await fetch(url, { ...init, signal });
  if (!res.ok) {
    // Prefer the upstream's own error message (e.g. Google Books "Quota exceeded...")
    // so the user can act on quota / API-key issues instead of a bare status code.
    let upstreamMessage = '';
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      upstreamMessage = body.error?.message ?? '';
    } catch {
      // Non-JSON error body — fall back to the status line.
    }
    const message = upstreamMessage ? `Upstream request failed (${res.status}): ${upstreamMessage}` : `Upstream request failed (${res.status})`;
    throw new UpstreamError(res.status, message);
  }
  return res.json() as Promise<T>;
}

/**
 * Jikan's Cloudflare edge rejects Node's default TLS 1.3 handshake fingerprint
 * (HTTP 504/429 on otherwise-good requests) — pinning TLS 1.2 via node:https
 * passes. Used by the Jikan provider only; TMDb/Google Books keep fetchJson.
 */
export function fetchJikanJson<T>(url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { 'User-Agent': 'Stash/1.0 (self-hosted)', Accept: 'application/json', Connection: 'close' },
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.2',
      },
      (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => {
          body += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode ?? 500;
          if (status < 200 || status >= 300) {
            let upstreamMessage = '';
            try {
              upstreamMessage = (JSON.parse(body) as { message?: string }).message ?? '';
            } catch {
              // Non-JSON error body — fall back to the status line.
            }
            const message = upstreamMessage
              ? `Upstream request failed (${status}): ${upstreamMessage}`
              : `Upstream request failed (${status})`;
            reject(new UpstreamError(status, message));
            return;
          }
          try {
            resolve(JSON.parse(body) as T);
          } catch {
            reject(new Error('Invalid JSON from upstream'));
          }
        });
      }
    );
    req.setTimeout(20_000, () => req.destroy(new Error('Upstream request timed out')));
    req.on('error', reject);
  });
}