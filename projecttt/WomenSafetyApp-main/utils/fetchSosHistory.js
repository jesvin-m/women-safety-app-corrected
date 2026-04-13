import { getServerBaseUrl } from './serverConfig';

/**
 * @returns {Promise<{ ok: boolean, items?: array, message?: string, error?: string }>}
 */
export async function fetchSosHistory(limit = 50) {
  const base = getServerBaseUrl();
  if (!base) {
    return {
      ok: false,
      error: 'Set EXPO_PUBLIC_SERVER_URL in .env (e.g. your ngrok URL).',
      items: [],
    };
  }

  const res = await fetch(`${base}/api/sos-history?limit=${limit}`, {
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const text = await res.text();
  const trimmed = text.trim();
  let json;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      json = JSON.parse(trimmed);
    } catch {
      return {
        ok: false,
        error: trimmed.slice(0, 200) || 'Invalid JSON from server',
        items: [],
      };
    }
  } else {
    return {
      ok: false,
      error:
        trimmed.slice(0, 200) ||
        `Expected JSON (HTTP ${res.status}). Check server URL and ngrok.`,
      items: [],
    };
  }

  if (!res.ok || !json.ok) {
    return {
      ok: false,
      error: json.error || `HTTP ${res.status}`,
      items: [],
    };
  }

  return {
    ok: true,
    items: json.items || [],
    message: json.message,
  };
}
