// services/headshots.ts
// Anti-corruption boundary for player/coach headshot images.
//
// Two distinct paths exist in EraBall and BOTH are preserved exactly:
//   1. Live UI player photos hotlink cdn.nba.com directly from an <img> tag. That path
//      needs no service (it is a pure render concern with an onError placeholder) and is
//      intentionally NOT wrapped here -- wrapping it would change rendering behavior.
//   2. The share-card canvas export and coach photos go through the same-origin proxy
//      routes (/api/headshot, /api/coach-headshot) to dodge canvas CORS taint. Those are
//      the I/O calls this service owns.
//
// Graceful degradation: when the proxy routes are absent (fully-static fork), every
// function resolves to `null`. Callers already render a slot-initial placeholder on
// null, so the UI degrades cleanly with no server.
//
// [PERF] each proxy fetch is timed and logged as `[PERF] headshot.<op>: Xms (ok|null)`.

const HEADSHOT_CACHE = 'eraball-headshots-v1';
// url -> objectURL, so repeated coach lookups in a session reuse one blob URL.
const _sessionCache = new Map<string, string>();

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function logPerf(op: string, startMs: number, outcome: 'ok' | 'null'): void {
  const ms = Math.round((now() - startMs) * 10) / 10;
  // eslint-disable-next-line no-console
  console.log(`[PERF] headshot.${op}: ${ms}ms (${outcome})`);
}

// Cache-first fetch using the browser Cache Storage API when available. Throws on a
// non-OK response so callers can map failure to the null placeholder. Identical to the
// original inline getCachedResponse helper -- behavior is preserved, only relocated.
async function getCachedResponse(url: string): Promise<Response> {
  if (typeof caches !== 'undefined') {
    try {
      const c = await caches.open(HEADSHOT_CACHE);
      const hit = await c.match(url);
      if (hit) return hit;
    } catch {
      // Cache API unavailable/blocked -- fall through to a plain network fetch.
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('not found');
  if (typeof caches !== 'undefined') {
    try {
      const c = await caches.open(HEADSHOT_CACHE);
      await c.put(url, res.clone());
    } catch {
      // Best-effort cache write; ignore quota/security errors.
    }
  }
  return res;
}

// Share-card path: fetch one player headshot via the proxy and return it as a base64
// data URL (required so html-to-canvas can rasterize it without tainting the canvas).
// Returns null on any failure -> caller renders the slot-initial placeholder.
export async function getShareCardHeadshot(personId: string): Promise<string | null> {
  const t = now();
  try {
    const res = await getCachedResponse(`/api/headshot?id=${personId}`);
    const blob = await res.blob();
    const base64 = await new Promise<string | null>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    logPerf('getShareCardHeadshot', t, base64 ? 'ok' : 'null');
    return base64;
  } catch {
    logPerf('getShareCardHeadshot', t, 'null');
    return null;
  }
}

// Batch the share-card headshots for a set of player ids, preserving the original
// Promise.all shape. Resolves to a person_id -> dataURL|null map. Never rejects.
export async function getShareCardHeadshots(
  personIds: string[],
): Promise<Record<string, string | null>> {
  const entries = await Promise.all(
    personIds.map(async id => [id, await getShareCardHeadshot(id)] as const),
  );
  return Object.fromEntries(entries);
}

// Coach photo path: fetch via the proxy and return a session-cached objectURL, or null
// on failure. Mirrors the original fetchCachedHeadshot, with null instead of a throw so
// the UI placeholder path is uniform with the static fork.
export async function getCoachHeadshot(name: string): Promise<string | null> {
  const url = `/api/coach-headshot?name=${encodeURIComponent(name)}`;
  if (_sessionCache.has(url)) return _sessionCache.get(url) as string;
  const t = now();
  try {
    const res = await getCachedResponse(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    _sessionCache.set(url, objectUrl);
    logPerf('getCoachHeadshot', t, 'ok');
    return objectUrl;
  } catch {
    logPerf('getCoachHeadshot', t, 'null');
    return null;
  }
}
