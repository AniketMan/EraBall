// rng.ts
// Centralized random number source for the simulation engine.
//
// PURPOSE
// The engine historically called Math.random() directly in ~20 places, which made
// the simulation impossible to reproduce or snapshot-test. This module routes all
// engine randomness through a single function so it can optionally be seeded for
// deterministic output (testing, behavior-lock snapshots) while remaining byte-for-byte
// identical to the original Math.random() behavior in production when left unseeded.
//
// BEHAVIOR CONTRACT
// - Unseeded (default): rng() delegates to Math.random(). Production output is unchanged.
// - Seeded: rng() produces a deterministic, repeatable stream via mulberry32.
//
// mulberry32 is a small, fast, well-distributed 32-bit PRNG. It is NOT cryptographically
// secure and must never be used for security purposes; it is only for game simulation.

// Active generator. null means "delegate to Math.random()".
let activeGenerator: (() => number) | null = null;

// mulberry32: deterministic PRNG seeded by a single 32-bit integer.
// Returns a function producing floats in [0, 1), matching Math.random()'s range.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0; // force unsigned 32-bit
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// rng: the single random source the engine must use instead of Math.random().
// Returns a float in [0, 1).
export function rng(): number {
  return activeGenerator !== null ? activeGenerator() : Math.random();
}

// seedRng: install a deterministic generator. Used by tests and snapshot harnesses
// to make the simulation reproducible. Pass any integer seed.
export function seedRng(seed: number): void {
  activeGenerator = mulberry32(seed);
}

// clearRng: restore default behavior (delegate to Math.random()). Used to return
// the engine to production randomness after a deterministic run.
export function clearRng(): void {
  activeGenerator = null;
}

// isSeeded: report whether a deterministic generator is currently active.
export function isSeeded(): boolean {
  return activeGenerator !== null;
}
