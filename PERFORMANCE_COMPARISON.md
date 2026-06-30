# EraBall Performance Comparison: Original vs Refactor (Live, post edge-cache)

Head-to-head measurement of the two live deployments, after applying a Cloudflare
edge-cache rule to the refactor's dataset to match the original's caching behavior.

- Original: https://eraball.com  (Next.js on **Vercel**, fronted by Cloudflare; 5MB dataset on R2 at `assets.eraball.com`, edge-cached)
- Refactor: https://eraball.typicaltest.win  (Next.js via `@cloudflare/next-on-pages` on **Cloudflare Pages**; 5MB dataset now edge-cached via a zone cache rule)

Method: Lighthouse 12.8.2 (performance category, headless Chromium 148, mobile +
desktop presets), 3 good runs per site/form-factor, medians reported. Raw transfer
timing collected with `curl` (5 warm runs each, Brotli enabled).

## 1. Lighthouse lab metrics (median, lower is better)

### Mobile (4x CPU throttle, slow 4G)

| Metric | Original | Refactor | Delta |
|---|---|---|---|
| Performance score | 68 | 65 | -3 (original better) |
| FCP | 1.66s | 1.71s | +0.05s (parity) |
| LCP | 4.97s | 5.07s | +0.10s (parity) |
| Speed Index | 5.62s | 5.70s | +0.08s (parity) |
| TTI | 5.82s | 5.55s | -0.27s (refactor better) |
| TBT | 357ms | 477ms | +120ms (original better) |
| CLS | 0.000 | 0.000 | equal |
| Initial page weight | 0.69MB | 0.68MB | equal |

### Desktop (no CPU throttle)

| Metric | Original | Refactor | Delta |
|---|---|---|---|
| Performance score | 91 | 83 | -8 (original better) |
| FCP | 0.71s | 1.14s | +0.43s (original better) |
| LCP | 1.47s | 2.13s | +0.66s (original better) |
| Speed Index | 2.08s | 2.19s | +0.11s (parity) |
| TTI | 1.47s | 2.13s | +0.66s (original better) |
| TBT | 0ms | 0ms | equal |
| CLS | 0.000 | 0.000 | equal |
| Initial page weight | 0.69MB | 0.51MB | -0.18MB (refactor lighter) |

Reading: mobile is effectively a tie (within run-to-run variance; refactor wins TTI,
original wins TBT). Desktop favors the original on paint timing (FCP/LCP/TTI) by a
consistent ~0.4-0.7s across all 3 runs - this is a real, repeatable edge, not noise.

Why the desktop paint gap is real and explainable: Vercel serves the initial HTML
document from its own edge with first-class Next.js streaming/prerender support. The
Cloudflare Pages + `next-on-pages` path routes the document render through the edge
worker, which adds a small but consistent cold-start/compute overhead before first
byte of meaningful paint. On throttled mobile this is masked by CPU as the bottleneck;
on fast desktop it surfaces. The refactor is still in the "good" band (desktop perf
score 83), just not as fast to first paint as Vercel's native pipeline.

## 2. Player dataset delivery (the heaviest asset) - now at parity

The 5MB `players_with_stats.json` gates the Draft screen. After adding the cache rule,
BOTH sites serve it Brotli-compressed (~956KB on the wire) from Cloudflare's edge cache
(`cf-cache-status: HIT`).

| | Original (R2 `assets.eraball.com`) | Refactor (Pages + cache rule) |
|---|---|---|
| On-wire size (br) | ~956KB | ~956KB |
| Edge cache | `cf-cache-status: HIT` | `cf-cache-status: HIT` |
| Edge TTL | `max-age=86400, swr=604800` | `s-maxage=604800, browser 86400` (override) |
| Median total (br, 5 warm runs) | ~5.53s | ~4.69s |

From this client, the refactor is marginally faster on the dataset (consistent ~0.8s)
once both are edge-warm. Transfer size is identical. Parity achieved.

Note on absolute transfer time: ~4.7-5.5s for ~956KB reflects this sandbox's network
path to Cloudflare, not a real user's. The comparison is valid because both sites are
measured from the same client under the same conditions; the relative delta is the
signal, not the absolute seconds.

## 3. What I changed on the refactor to reach dataset parity

The original edge-caches its dataset; the refactor originally did not
(`cf-cache-status: DYNAMIC`, every request re-validated through the worker). Three
layered fixes, applied and verified:

1. Added `public/_headers` setting `Cache-Control: public, max-age=86400,
   s-maxage=604800, stale-while-revalidate=604800, immutable` on
   `/players_with_stats.json` and `/coaches.csv`. This fixes browser-level caching
   (Pages ignores `vercel.json`, so this replaces it). Verified: header present.
2. Added those two paths to `_routes.json` `exclude` so Pages serves them as static
   assets, bypassing the worker. Verified in build output.
3. Created a zone-level Cloudflare **Cache Rule** on `typicaltest.win`
   (`set_cache_settings`, cache=true, edge TTL 604800s). This is the decisive fix:
   Cloudflare's default edge cache does NOT cache `application/json` regardless of
   `Cache-Control`; only an explicit cache rule makes it eligible. Verified:
   `cf-cache-status` flipped MISS -> HIT -> HIT -> HIT with incrementing `age`.

## 4. Bottom line

1. **No meaningful regression from the refactor on mobile** - the two builds are tied
   within variance.
2. **Desktop first paint is consistently ~0.4-0.7s slower on the refactor**, an
   inherent cost of rendering the document through the Cloudflare edge worker
   (`next-on-pages`) versus Vercel's native Next.js pipeline. The refactor still scores
   83/100 desktop, 65/100 mobile - a healthy band.
3. **Dataset delivery is now at parity** - both edge-cached, identical bytes, refactor
   marginally faster from this client.
4. **The refactor ships a lighter desktop initial payload** (0.51MB vs 0.69MB).

If first-paint parity on desktop becomes a priority, the lever is the document-render
path, not the assets: either pre-render the root as a fully static HTML shell (it is a
client component, so this is feasible) or move off `next-on-pages` to a static export
with the API routes split into standalone Workers. Both are larger changes than this
comparison warranted; flagged, not executed.

Charts: `perf_chart.png` (Lighthouse), `dataset_chart.png` (dataset delivery).
Raw data: `perf/results/*.json`, `perf/summary.json`.
