import { useEffect, useState, type FormEvent } from 'react';
import type { ApiSettings } from '../types/media';
import { getSettings, saveSettings as saveSettingsApi } from '../services/api';

const EMPTY_SETTINGS: ApiSettings = {
  tmdb_api_key: { configured: false, masked: 'Not configured' },
  google_books_api_key: { configured: false, masked: 'Not configured' },
  jikan_api_key: { configured: false, masked: 'Not configured' },
};

type KeyName = 'tmdb_api_key' | 'google_books_api_key' | 'jikan_api_key';

const FIELDS: { key: KeyName; label: string; hint: string; required?: boolean }[] = [
  {
    key: 'tmdb_api_key',
    label: 'TMDb API Key',
    hint: 'For movies & TV search. Get one at themoviedb.org/settings/api',
    required: true,
  },
  {
    key: 'google_books_api_key',
    label: 'Google Books API Key',
    hint: 'Optional — helps stay under quota limits for book search.',
  },
  {
    key: 'jikan_api_key',
    label: 'MyAnimeList Client ID',
    hint: 'Optional — free at myanimelist.net/apiconfig. Anime works without it (via Kitsu); this prefers the official MAL API when Jikan is down.',
  },
];

export default function SettingsConsole() {
  const [settings, setSettings] = useState<ApiSettings>(EMPTY_SETTINGS);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [replacing, setReplacing] = useState<Set<KeyName>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((s) => {
        if (!cancelled) {
          setSettings(s);
          setValues((prev) => {
            const next: Record<string, string> = {};
            for (const k of Object.keys(s) as KeyName[]) {
              next[k] = prev[k] ?? '';
            }
            return next;
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    // Only send keys the user actually typed — an empty field keeps the stored
    // key, so a bare "Save" (or a replaced-but-blank field) can never wipe one.
    const changed: Partial<Record<KeyName, string>> = {};
    for (const k of Object.keys(values) as KeyName[]) {
      const value = values[k]?.trim();
      if (value) changed[k] = value;
    }

    if (Object.keys(changed).length === 0) {
      setStatus({ ok: true, message: 'No changes to save — add a key to configure it.' });
      setReplacing(new Set());
      return;
    }

    setSaving(true);
    try {
      const updated = await saveSettingsApi(changed);
      setSettings(updated);
      setStatus({ ok: true, message: 'Settings saved. Keys are stored server-side.' });
      // clear the input fields and re-lock configured keys after a successful save
      setValues({});
      setReplacing(new Set());
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-16">
        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-medium text-white mb-1">⚙ Settings</h2>
      <p className="text-sm text-gray-400 mb-6">
        API keys are stored in PostgreSQL and used server-side only — your browser never sees them.
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        {FIELDS.map(({ key, label, hint, required }) => {
          const configured = settings[key]?.configured;
          const locked = configured && !replacing.has(key);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={key} className="block text-sm font-medium text-gray-300">
                  {label}
                  {required && <span className="text-accent ml-1">*</span>}
                </label>
                {configured && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-400">✓ Configured</span>
                    {locked ? (
                      <button
                        type="button"
                        onClick={() => setReplacing((prev) => new Set(prev).add(key))}
                        className="text-accent hover:underline"
                      >
                        Replace
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReplacing((prev) => {
                          const next = new Set(prev);
                          next.delete(key);
                          return next;
                        })}
                        className="text-gray-400 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
              <input
                id={key}
                type="password"
                autoComplete="off"
                disabled={locked}
                value={values[key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={locked ? 'Field locked while configured' : configured ? 'Enter a new key to replace' : 'Paste your API key'}
                className="w-full px-3 py-2 bg-surface-card border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-hover"
              />
              <p className="text-xs text-gray-500 mt-1">{hint}</p>
            </div>
          );
        })}

        {status && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
            saving
              ? 'bg-surface-hover text-gray-400 cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover'
          }`}
        >
          {saving ? 'Saving…' : 'Save API Keys'}
        </button>
      </form>
    </div>
  );
}