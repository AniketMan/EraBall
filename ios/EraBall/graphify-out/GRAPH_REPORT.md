# Graph Report - .  (2026-07-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 858 nodes · 1944 edges · 51 communities (49 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c434c83`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]

## God Nodes (most connected - your core abstractions)
1. `isAuthError()` - 74 edges
2. `_returnResult()` - 44 edges
3. `constructor()` - 35 edges
4. `handleOperation()` - 28 edges
5. `join()` - 27 edges
6. `push()` - 26 edges
7. `_useSession()` - 26 edges
8. `Player` - 22 edges
9. `CodingKeys` - 22 edges
10. `Engine` - 21 edges

## Surprising Connections (you probably didn't know these)
- `CourtSlotCard` --references--> `CourtSlot`  [EXTRACTED]
  Components/CourtSlotView.swift → Core/Engine.swift
- `EraBallApp` --calls--> `AppState`  [INFERRED]
  EraBallApp.swift → Core/AppState.swift
- `LifetimeStatsView` --references--> `StatsData`  [EXTRACTED]
  Views/LifetimeStatsView.swift → Core/AppState.swift
- `AchievementToast` --references--> `Achievement`  [EXTRACTED]
  EraBallApp.swift → Core/AppState.swift
- `DraftView` --references--> `Player`  [EXTRACTED]
  Views/DraftView.swift → Core/Engine.swift

## Import Cycles
- None detected.

## Communities (51 total, 2 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (37): Codable, Coach, all_teams_by_era, CourtSlot, Engine, EngineError, missingResource, parseError (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (61): _cancelPendingDisconnect(), cancelRefEvent(), cancelTimeout(), channel(), clearHeartbeats(), connect(), connectionState(), connectWithFallback() (+53 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (22): AVFoundation, AVPlayer, AudioManager, Bool, Double, String, AchievementID, GameCenterDelegate (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (32): calcAstFactor(), calcBlkScore(), calcEraModifier(), calcFitPenalty(), calcPlayerAdjustedRating(), calcPlayerDefFactor(), calcRebFactor(), calcTeamDefTotals() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (31): cloneRequestState(), containedBy(), contains(), dec2hex(), delete(), dropNamespace(), explain(), generatePKCEVerifier() (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (18): App, Achievement, AppState, GamePhase, coachDraft, draft, eraSelect, loading (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (20): ButtonStyle, Color, Elevation, EraBallDivider, eraDisplayLabel(), Fonts, G, GhostButtonStyle (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (28): _adminDeletePasskey(), _adminListPasskeys(), _createCustomProvider(), _createOAuthClient(), createUser(), _deleteCustomProvider(), _deleteFactor(), _deleteOAuthClient() (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (26): copy(), createBucket(), createIndex(), createSignedUploadUrl(), createSignedUrl(), createSignedUrls(), deleteBucket(), deleteIndex() (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (28): _approveAuthorization(), assertPasskeyExperimentalEnabled(), createNewAbortSignal(), _deletePasskey(), _denyAuthorization(), _emitInitialSession(), _enroll(), _getAuthorizationDetails() (+20 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (24): _callRefreshToken(), _debug(), deepClone(), exchangeCodeForSession(), expiresAt(), hasSession(), insecureUserWarningProxy(), _isValidSession() (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (20): CodingKey, CodingKeys, AST, BLK, duoActiveCount, duoPartnerName, era, FG3_PCT (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (15): CaseIterable, GameKit, String, LeaderboardRow, LeaderboardScope, friends, global, LeaderboardSheet (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (14): CourtSlotRow, DraftView, PlayerCardSheet, PlayerPoolRow, SpinPhase, idle, revealed, spinning (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (18): _binaryDecode(), binaryEncode(), _binaryEncodeUserBroadcastPush(), decode(), decodeBroadcast(), decodePush(), decodeReply(), _decodeUserBroadcast() (+10 more)

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (13): constructor(), createFetchClient(), getChannel(), getSocket(), _listenForAuthEvents(), _logPrefix(), memoryLocalStorageAdapter(), normalizeEndpoint() (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (11): BleedImage, CGFloat, URL, Star, Starfield, Double, Void, TopBar (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (15): ajax(), appendParams(), batchSend(), endpointURL(), ensureTrailingSlash(), handleError2(), _handleRequest2(), match() (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (9): CourtSlotCard, Bool, Double, String, PlayerHeadshotView, CGFloat, Int, String (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.26
Nodes (8): AchievementToast, LoadingView, RootView, View, EraBannerView, EraSelectView, HowToPlaySheet, String

### Community 21 - "Community 21"
Cohesion: 0.23
Nodes (12): __awaiter(), catch(), createSiweMessage(), fetchRequest(), finally(), fromHex(), getAddress(), getPromise() (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (11): abortSignal(), _challenge(), _challengeAndVerify(), createCredential(), deepMerge(), getCredential(), identifyAuthenticationError(), identifyRegistrationError() (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (7): _acquireLock(), _authenticate(), _autoRefreshTokenTick(), browserSupportsWebAuthn(), _register(), signOut(), _verify()

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (11): canPush(), hasReceived(), isJoined(), isMember(), joinRef(), leave(), receive(), subscribe() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (11): createNamespace(), createNamespaceIfNotExists(), endPoint(), _fetchWithTimeout(), httpSend(), request(), send(), track() (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (10): applySettingDefaults(), _defineProperty3(), _initRealtimeClient(), _initSupabaseAuthClient(), normalizeTracePropagation(), _objectSpread23(), ownKeys3(), toPrimitive3() (+2 more)

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (10): applyTransformOptsToQuery(), download(), execute(), exists(), _getFinalPath(), getPublicUrl(), info(), isStorageError() (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.31
Nodes (9): base64UrlToUint8Array(), byteFromBase64URL(), decodeJWT(), deserializeCredentialCreationOptions(), deserializeCredentialRequestOptions(), generateLink(), _generateLinkResponse(), __rest() (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (8): createMemorySessionStorage(), detectEnvironment(), getWebSocketConstructor(), _initializeOptions(), isWebSocketSupported(), onHeartbeat(), resolveSessionStorage(), _wrapHeartbeatCallback()

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (8): createTable(), createTableIfNotExists(), dropTable(), listTables(), loadTable(), namespaceToPath2(), tableExists(), updateTable()

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (7): __awaiter2(), extractTraceContext(), getTraceHeaders(), loadOtel(), matchStringTarget(), parseTraceParent(), shouldPropagateToTarget()

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (7): fetchJwk(), _getAccessToken(), getAlgorithm(), _getAuthenticatorAssuranceLevel(), getClaims(), getSession(), validateExp()

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (7): getCodeChallengeAndMethod(), resend(), resetPasswordForEmail(), signInWithOtp(), signInWithSSO(), signUp(), _ssoResponse()

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): _getSessionFromURL(), _handleVisibilityChange(), initialize(), isAuthImplicitGrantRedirectError(), _isImplicitGrantCallback(), _isPKCECallback(), parseParametersFromURL()

### Community 35 - "Community 35"
Cohesion: 0.47
Nodes (6): cloneState(), onJoinPayload(), onLeavePayload(), parseCurrentPresences(), state(), transformState()

### Community 36 - "Community 36"
Cohesion: 0.40
Nodes (6): _defineProperty(), _objectSpread2(), ownKeys(), toPrimitive(), toPropertyKey(), _typeof()

### Community 37 - "Community 37"
Cohesion: 0.60
Nodes (6): dispose(), _onVisibilityChanged(), _removeVisibilityChangedCallback(), _startAutoRefresh(), _stopAutoRefresh(), timeout()

### Community 38 - "Community 38"
Cohesion: 0.40
Nodes (5): CoachDraftView, CoachRow, Bool, String, Void

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (5): bytesToBase64URL(), byteToBase64URL(), serializeCredentialCreationResponse(), serializeCredentialRequestResponse(), toJSON()

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (3): close(), closeAndRetry(), ontimeout()

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (4): checkAchievements(), getAllAchievements(), getUnlocked(), saveUnlocked()

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (4): defaults(), getLifetimeStats(), recordRunComplete(), save()

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (4): _defineProperty2(), toPrimitive2(), toPropertyKey2(), _typeof2()

### Community 44 - "Community 44"
Cohesion: 1.00
Nodes (3): clone(), syncDiff(), syncState()

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (3): coachDefGrade(), coachOffGrade(), gradeFromPct()

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (3): coachOverallGrade(), gradeToNumber(), numberToGrade()

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (3): codepointToUTF8(), stringToUint8Array(), stringToUTF8()

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (3): _listOAuthClients(), listUsers(), _noResolveJsonResponse()

## Knowledge Gaps
- **38 isolated node(s):** `loading`, `eraSelect`, `draft`, `coachDraft`, `simulation` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SwiftUI` connect `Community 17` to `Community 1`, `Community 3`, `Community 6`, `Community 7`, `Community 38`, `Community 13`, `Community 14`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `CodingKeys` connect `Community 12` to `Community 1`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `Player` connect `Community 1` to `Community 19`, `Community 14`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `loading`, `eraSelect`, `draft` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.016260162601626018 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09781420765027322 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.055191256830601096 - nodes in this community are weakly interconnected._