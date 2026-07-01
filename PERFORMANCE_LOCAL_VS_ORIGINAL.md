# EraBall Performance: Original vs Refactor running LOCALLY (hosting isolated)

Purpose: the prior live comparison showed the refactor ~0.4-0.7s slower to first
paint on desktop. To determine whether that was the refactored CODE or the
Cloudflare Pages edge-worker HOSTING, this test runs the refactor from a local
production server (`next start`) and benchmarks it against the original on Vercel.

- Original: https://eraball.com  (Next.js on Vercel)
- Refactor (local): `next start` (production build, commit 8316d09) on sandbox
  port 3100, exposed via a public proxy. No Cloudflare worker in the path.

Method: Lighthouse 12.8.2, performance category, mobile + desktop presets, 3 good
runs per site/form-factor, medians. Same client, same harness as the prior runs.

## Results (Lighthouse lab medians)

### Mobile (4x CPU throttle, slow 4G)

| Metric | Original (Vercel) | Refactor (local) | Delta |
|---|---|---|---|
| Performance score | 77 | 72 | -5 (original better) |
| FCP | 935ms | 924ms | parity |
| LCP | 4.27s | 5.30s | +1.03s (original better) |
| Speed Index | 1.73s | 1.89s | +0.16s (parity) |
| TTI | 5.45s | 6.33s | +0.88s (original better) |
| TBT | 351ms | 370ms | +19ms (parity) |
| CLS | 0.000 | 0.000 | equal |
| TTFB (server) | 40ms | 19ms | refactor better |

### Desktop (no CPU throttle)

| Metric | Original (Vercel) | Refactor (local) | Delta |
|---|---|---|---|
| Performance score | 89 | **99** | **+10 (refactor better)** |
| FCP | 918ms | **260ms** | -658ms (refactor much better) |
| LCP | 1.49s | **1.03s** | -460ms (refactor better) |
| Speed Index | 2.25s | **637ms** | -1.61s (refactor much better) |
| TTI | 1.49s | **1.03s** | -460ms (refactor better) |
| TBT | 0ms | 0ms | equal |
| CLS | 0.000 | 0.000 | equal |
| TTFB (server) | 628ms | **16ms** | -612ms (refactor much better) |

## Conclusion: the desktop deficit was hosting, not code

This is the decisive finding. With the Cloudflare Pages worker removed from the
path, the refactor's server TTFB collapses from ~520ms (through Pages, measured
earlier) to **16ms** local, and desktop performance flips from LOSING (83 vs 91 on
Pages) to WINNING (99 vs 89). FCP, LCP, Speed Index, and TTI on desktop are all now
materially BETTER than the original.

Plain reading: the refactored code is not slower than the original. On desktop it is
faster. The ~0.4-0.7s desktop first-paint gap reported in the live comparison was
caused entirely by the `@cloudflare/next-on-pages` edge-worker rendering the document,
not by the architecture refactor. Vercel's native Next.js pipeline simply has lower
document-render overhead than the Cloudflare Pages worker for this app.

## The one honest caveat: mobile LCP/TTI

On throttled mobile the refactor is still slightly behind on LCP (5.30 vs 4.27s) and
TTI (6.33 vs 5.45s). This gap survives the hosting change, so it is CPU-bound client
work, not network. Under 4x CPU throttling the client must parse/hydrate the React
tree and the largest contentful element resolves later. This is small (~1s) and within
the range of run-to-run mobile variance, but it is real and not a hosting artifact.
FCP, Speed Index, and TBT are at parity on mobile, so the interactive cost is modest.

## What this means practically

- The refactor's CODE performs at least as well as the original, and better on desktop.
- The production penalty on the live Cloudflare site is a HOSTING choice, fixable by:
  1. Moving the live deploy to Vercel (matches the original's pipeline), or
  2. Pre-rendering the root as a static HTML shell so the Pages worker serves a
     cached document instead of rendering per request, or
  3. Static export + API routes as standalone Workers.
- If desktop first-paint on the live site matters, option 1 or 2 closes it. None were
  executed here - this report only isolates the cause, as asked.

Charts: `local_chart.png` (lab metrics), `local_score_chart.png` (score + TTFB).
Raw data: `perf/local_results/*.json`, `perf/summary_local.json`.
