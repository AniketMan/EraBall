# EraBall iOS — Liquid Glass & HIG Compliance Report

**Scope:** iOS 26 SwiftUI app (`ios/EraBall`). Sourced from Apple HIG (`Materials`, `Buttons`, `Tab Bars`, `Scroll Views`, `Game Center`) and the WWDC25 "Meet Liquid Glass" master spec.

**TL;DR:** The port looks great, but in the last few iterations we drifted from Apple's single most important Liquid Glass rule — *glass belongs to the floating navigation/control layer, never the content layer.* Several content elements were given `glassEffect`, and the game‑mode/footer buttons use the **Clear** variant over a non‑media background (misuse). This report proposes pulling glass **back** to where it belongs, plus UX wins the material unlocks.

---

## The governing rules (verbatim intent)

1. **Glass is for the nav/control layer only.** "Don't use Liquid Glass in the content layer… use [standard materials] for elements in the content layer." (HIG Materials) The WWDC spec is blunter: *"Liquid Glass is reserved for the floating navigation and control layer and is never applied to content cells."*
2. **Never glass‑on‑glass.** Elements placed on top of glass use fills/vibrancy, not another glass layer.
3. **Regular vs Clear.** Regular = adaptive, legible anywhere, use for text‑heavy things. **Clear = only over visually rich media** (photos/video) *and* needs a dimming layer. Never mix the two in one context.
4. **Tint = 1–2 primary actions per view, max.** Broad brand color lives in the **content layer**, not painted on chrome. (HIG Buttons: "Keep the number of prominent buttons to one or two per view.")
5. **Use glass sparingly on custom controls** — overuse distracts from content.

---

## Part A — Compliance findings (fix these)

### A1. Glass applied to content cells ❌ → use standard materials
Rule 1 & 2. These are *content*, not navigation, and several also nest glass‑in‑glass (a glass card inside a glass sheet).

| Element | File | Current | Proposed |
|---|---|---|---|
| Tag‑effects rows | `Views/DraftView.swift` `TagEffectsSheet` | `.glassEffect(.regular.tint…, in: .rect)` per row | Solid `G.surface` + colored left border + `.background(.ultraThinMaterial)` at most. Keep the **sheet's** dimming; drop per‑row glass. |
| Supporter rows | `Views/Modals.swift` `SupportersSheet` | `.glassEffect` per row | Same — standard surface + tier gradient + the sheen. Rows are content. |
| Era description panel | `Views/EraSelectView.swift` `bannerBlock` | `.glassEffect(.regular, in: .rect)` | Standard material (`.regularMaterial`) or solid `G.surface`. It's a content readout, not a control. |
| Stat/box‑score cards | `SimulationView` sheets | (some glass) | Content → standard materials. |

**Why it matters:** glass in the content layer "can result in… a confusing visual hierarchy" (HIG). It also taxes the compositor (every glass node = a live refraction pass).

### A2. Clear variant misused ❌ → Regular
Rule 3. `ClearGlassButton` (NORMAL / SALARY CAP / RANDOM / SANDBOX) and the footer links use `.clear` over the **starfield/black** era‑select background — not "visually rich media," and with no dimming layer. Clear is for controls floating over photos/video.

**Proposed:** switch these to **Regular** (`.glassEffect(.regular.tint(…).interactive())`) — it's adaptive and legible over any background, which is exactly this case. Keep the sharp‑rect + border treatment.

### A3. Too many prominent/tinted buttons ❌ → 1–2 per view
Rule 4. The era‑select screen tints NORMAL (gold), SALARY CAP (purple), RANDOM, SANDBOX, SUPPORT, HALL OF FAME all at once. HIG: one or two prominent per view.

**Proposed:** **NORMAL DRAFT** is the single primary (tinted/prominent). SALARY CAP = neutral glass. RANDOM/SANDBOX/footer = quiet neutral glass, no tint. Let the era art carry the color (content layer).

### A4. Nav bar was being color‑graded ✅ already fixed
The era‑theme filter no longer touches the tab bar (moved off `RootView` onto per‑screen content). Good — the nav layer must stay neutral/adaptive.

### A5. Game Center uses deprecated modal API ⚠️ (separate task, in progress)
`GKGameCenterViewController` is deprecated in iOS 26. Per HIG Game Center, adopt the **`GKAccessPoint`** Game Overlay for dashboards, and render the in‑app leaderboard as a **custom SwiftUI list** from `loadLeaderboard(...)` (already implemented in the manager). Removes the 10 deprecation warnings and the embedded‑VC content‑layer glass.

---

## Part B — UX improvements the material enables

### B1. Player pool as a contained, scrolling box ✅ implemented
Matches the web's boxed, self‑scrolling roster with pinned sort/filter. *Note:* it's a nested same‑axis ScrollView; if it fights the page scroll on device, the robust alternative is to **pin the court** (non‑scrolling header) and let only the pool scroll — a cleaner model than one long page.

### B2. Real scroll‑edge effects
Right now the top bar is a solid `G.surface`. iOS 26 gives floating bars a **scroll edge effect** for free when content scrolls under a real glass bar. Proposal: make the top bar a true floating glass bar so content dissolves under it (HIG "Scroll edge effects"), instead of a hard opaque strip.

### B3. Tab bar `tabViewBottomAccessory` for music
The volume/now‑playing control could dock as a `tabViewBottomAccessory` above the tab bar — it fuses into the same glass unit and rides the minimize‑on‑scroll behavior. Very on‑spec, removes the top‑bar speaker crowding.

### B4. Morphing top‑bar controls
The `?`, ERA THEME, and volume boxes already share a `GlassEffectContainer`. Give the volume popover a `glassEffectID` so it **morphs out of** the speaker button (menu "unfurls from its own footprint") instead of a plain popover.

### B5. Reduce Motion / accessibility
Glass a11y modifiers are automatic, but our **custom** animations (spin reels, sheen beams, starfield, era‑theme scanlines) are not. Gate them behind `@Environment(\.accessibilityReduceMotion)` and `reduceTransparency`.

---

## Part C — Bugs fixed alongside this pass ✅

- **Team Rating table truncated names** ("LeBron Ja…"): all six columns used `maxWidth:.infinity` (equal 1/6 split, starving the name). Numeric columns are now fixed‑width so the name takes the remainder. `SimulationView.swift`.
- **Headshot centering (Kemba):** center‑crop left some players low; fill now anchors to `.top` so heads sit consistently. `PlayerHeadshotView.swift`.

---

## Priority order

1. **A1 + A2 + A3** — pull glass out of the content layer, Clear→Regular, one primary action. (Highest fidelity payoff, matches Apple's core rule.)
2. **A5** — GameKit deprecations (also deletes content‑layer glass).
3. **B2 / B3** — real scroll‑edge + docked accessory (make the *nav* layer shine, which is where glass is supposed to live).
4. **B5** — accessibility gating of custom motion.
5. **B1 refinement** — pin‑court model if nested scroll feels off on device.

**North star:** glass should make the *navigation* feel alive while the *basketball content* (cards, tables, era art) stays in crisp standard materials and carries the color. Right now we have it slightly inverted; the fixes above put it right.
