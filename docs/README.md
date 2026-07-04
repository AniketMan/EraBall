# EraBall — Dev Docs

- **[GAME_DESIGN.md](GAME_DESIGN.md)** — the authoritative game design spec (mechanics, flow, systems). Derived from the web app; applies identically to iOS (same engine, mirrored screens).
- **Code graphs & knowledge graph** — below.

Two complementary views of the codebase. Both regenerate offline (AST only, no API key).

```
docs/
├── refresh.sh              # regenerate everything below
├── dashboard.sh            # launch the interactive knowledge-graph dashboard
├── code-graph/             # graphify — full structural graphs (every file/symbol)
│   ├── ios/graph.html      #   open in a browser: click nodes, filter, search
│   └── web/graph.html
└── knowledge-graph/
    └── generate.mjs        # builds the curated Understand-Anything graph
```

The curated graph itself lives at `../.understand-anything/knowledge-graph.json`
(that path is where the Understand Anything dashboard looks for it).

## The two views

| View | What it is | Best for |
|------|-----------|----------|
| **Code graph** (`code-graph/*/graph.html`) | graphify's raw structural map — every file, function, class, import (iOS ≈ 860 nodes, web ≈ 500). | "Where is X? What calls it?" — exhaustive lookup. |
| **Knowledge graph** (`dashboard.sh`) | A curated 36-node Understand Anything graph with plain-English summaries, 6 domain layers, and an 8-step guided tour. | Onboarding — "how does this all fit together?" |

## Open them

**Code graphs** — just open the HTML:
```bash
open docs/code-graph/ios/graph.html
open docs/code-graph/web/graph.html
```

**Knowledge-graph dashboard** — interactive, dark/gold themed:
```bash
bash docs/dashboard.sh          # prints http://127.0.0.1:PORT/?token=...
```
Set `UNDERSTAND_ANYTHING_ROOT` if the plugin lives somewhere other than
`~/Documents/GitHub/Understand-Anything`.

## Regenerate after code changes

```bash
bash docs/refresh.sh
```

Rebuilds both structural graphs and the curated knowledge graph from current source.

## The 8-step guided tour (knowledge graph)

1. Start with the engine — one framework-free engine powers everything.
2. How a full game runs — `runGame()` → rating → season → playoffs.
3. The tag pipeline — the ordered transforms every player passes through.
4. iOS runs the **same** engine — via JavaScriptCore, proven byte-for-byte.
5. The Swift bridge — `Engine.swift` hosts `engine.js`; `GameSession` drives it.
6. The iOS screens — era → draft → coach → simulate.
7. Web parity source — the feature screens the iOS screens are ported from.
8. Data, services & Game Center.
