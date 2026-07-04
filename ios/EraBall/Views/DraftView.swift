// DraftView.swift — port of app/features/draft/DraftScreen.tsx
// Flow: spin -> pool. Tap a pool player to SELECT (shows the full card); empty court
// slots glow with a fit badge — tap an empty slot to PLACE the selected player.
import SwiftUI

struct DraftView: View {
    @Environment(GameSession.self) private var session
    @Environment(AudioManager.self) private var audio
    @State private var viewSlotPlayer: PlayerVM?
    @State private var courtWidth: CGFloat = 340
    @State private var sortBy: PoolSort = .pts
    @State private var posFilter: String? = nil
    @State private var showTagLegend = false
    @State private var showEraFilter = false

    enum PoolSort: String, CaseIterable { case special = "SPECIAL", pts = "PTS", reb = "REB", ast = "AST", fg3 = "3P%", stl = "STL", blk = "BLK", base = "BASE" }

    private func primaryPos(_ p: PlayerVM) -> String {
        let u = p.position.uppercased()
        if u.contains("GUARD") { return "G" }
        if u.contains("CENTER") { return "C" }
        return "F"
    }
    private var displayPool: [PlayerVM] {
        var list = session.pool
        if let pf = posFilter { list = list.filter { primaryPos($0) == pf } }
        switch sortBy {
        case .special: list = list.filter { !$0.tags.isEmpty }.sorted { $0.base > $1.base }
        case .pts:  list.sort { $0.PTS > $1.PTS }
        case .reb:  list.sort { $0.REB > $1.REB }
        case .ast:  list.sort { $0.AST > $1.AST }
        case .stl:  list.sort { ($0.STL ?? 0) > ($1.STL ?? 0) }
        case .blk:  list.sort { ($0.BLK ?? 0) > ($1.BLK ?? 0) }
        case .fg3:  list.sort { ($0.FG3_PCT ?? 0) > ($1.FG3_PCT ?? 0) }
        case .base: list.sort { $0.base > $1.base }
        }
        return list
    }

    private var state: GameStateVM? { session.gameState }
    private var starters: [SlotVM] { state?.slots.filter { !$0.isBench } ?? [] }
    private var bench: [SlotVM] { state?.slots.filter(\.isBench) ?? [] }

    var body: some View {
        VStack(spacing: 0) {
            topBar
            ScrollView {
                VStack(spacing: 16) {
                    court
                    if session.salaryCapMode { capMeter }
                    eraFilterPanel
                    spinSection
                    if let sel = session.selectedPoolPlayer { selectedBlock(sel) }
                    if !session.pool.isEmpty { poolList }
                }
                .padding(.horizontal, 16).padding(.bottom, 110)
            }
        }
        .background(G.black)
        .safeAreaInset(edge: .bottom) {
            if session.draftComplete {
                Button("DRAFT A COACH") { session.proceedToCoachDraft() }
                    .buttonStyle(GoldButtonStyle(fullWidth: true))
                    .padding(.horizontal, 24).padding(.bottom, 8)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.smooth(duration: 0.3), value: session.draftComplete)
        .animation(.smooth(duration: 0.2), value: session.selectedPoolPlayer)
        .animation(.smooth(duration: 0.2), value: showEraFilter)
        .sheet(item: $viewSlotPlayer) { p in
            NavigationStack {
                ScrollView { PlayerCardView(player: p).padding(16) }
                    .background(G.black)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("REMOVE", role: .destructive) {
                                if let idx = state?.slots.first(where: { $0.player?.personId == p.personId })?.index { session.remove(slotIndex: idx) }
                                viewSlotPlayer = nil
                            }
                        }
                        ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { viewSlotPlayer = nil }.foregroundStyle(G.gold) }
                    }
            }
            .presentationDetents([.medium, .large]).preferredColorScheme(.dark)
        }
        .sheet(isPresented: $showTagLegend) { TagEffectsSheet() }
        .onAppear { if let e = session.selectedEra { audio.play(era: e) } }
    }

    private var topBar: some View {
        HStack {
            Button { session.restart() } label: { Image(systemName: "chevron.left").font(.system(size: 15, weight: .semibold)).foregroundStyle(G.grey).frame(width: 34, height: 34) }
                .buttonStyle(.plain).glassEffect(.regular.interactive(), in: .rect(cornerRadius: 0))
                .overlay(Rectangle().stroke(G.border, lineWidth: 1))
            Spacer()
            VStack(spacing: 2) {
                Text(session.salaryCapMode ? "SALARY CAP DRAFT" : "PLAYER DRAFT")
                    .font(.system(size: 13, weight: .bold)).tracking(2.5).foregroundStyle(session.salaryCapMode ? G.purple : G.gold)
                Text("SIM ERA · \(eraDisplayLabel(session.selectedEra ?? "").uppercased())")
                    .font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
            }
            Spacer()
            HStack(spacing: 8) {
                SettingsGearButton()
                Button { showTagLegend = true } label: {
                    Image(systemName: "info.circle").font(.system(size: 15, weight: .semibold)).foregroundStyle(G.gold)
                        .frame(width: 34, height: 34).contentShape(.rect)
                }
                .buttonStyle(.plain).glassEffect(.regular.interactive().tint(G.gold.opacity(0.14)), in: .rect(cornerRadius: 0))
                .overlay(Rectangle().stroke(G.gold.opacity(0.5), lineWidth: 1))
                Text("\(state?.filledCount ?? 0)/9").font(.system(size: 13, weight: .bold, design: .monospaced)).foregroundStyle(G.grey).frame(width: 34)
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 10)
        .overlay(alignment: .bottom) { EraBallDivider() }
    }

    // MARK: Era Filter Panel

    private let ALL_ERAS_ORDERED = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]

    private var eraFilterPanel: some View {
        let locked = session.eraFilterLocked
        let isCustomRange = session.eraFilter.count < ALL_ERAS_ORDERED.count
        return VStack(spacing: 0) {
            Button {
                if !locked { showEraFilter.toggle() }
            } label: {
                HStack {
                    Text(locked
                         ? (isCustomRange ? "Custom Range \u{00B7} \(session.eraFilter.count) eras locked" : "Custom Range \u{00B7} Locked")
                         : "Custom Range (optional)")
                        .font(.system(size: 10, weight: .semibold)).tracking(2)
                        .foregroundStyle(locked ? G.goldDim : G.greyDark)
                    Spacer()
                    if !locked {
                        Text(showEraFilter ? "\u{25B2}" : "\u{25BC}")
                            .font(.system(size: 8)).foregroundStyle(G.greyDark)
                    }
                }
                .padding(.horizontal, 12).padding(.vertical, 8)
            }
            .buttonStyle(.plain)
            .overlay(alignment: .bottom) {
                if showEraFilter || (locked && isCustomRange) { EraBallDivider() }
            }
            if showEraFilter || (locked && isCustomRange) {
                VStack(spacing: 0) {
                    FlexibleWrap(ALL_ERAS_ORDERED, spacing: 0) { era in
                        let on = session.eraFilter.contains(era)
                        Button {
                            if !locked { session.toggleEraFilter(era) }
                        } label: {
                            Text(era.uppercased())
                                .font(.system(size: 10, weight: .semibold)).tracking(2)
                                .foregroundStyle(on ? G.gold : G.greyDark)
                                .padding(.horizontal, 10).padding(.vertical, 6)
                                .background(on ? G.gold.opacity(0.07) : Color.clear)
                                .overlay(alignment: .bottom) {
                                    Rectangle().fill(on ? G.gold : Color.clear).frame(height: 2)
                                }
                                .opacity(locked && !on ? 0.4 : 1)
                        }
                        .buttonStyle(.plain).disabled(locked)
                    }
                    .padding(.horizontal, 8).padding(.top, 4).padding(.bottom, 2)
                    HStack(spacing: 12) {
                        let excluded = ALL_ERAS_ORDERED.count - session.eraFilter.count
                        let lockedMsg = "Locked. Excluding \(excluded) era\(excluded != 1 ? "s" : ""). Not eligible for leaderboard."
                        Text(locked ? lockedMsg : "Select eras, then lock to apply.")
                            .font(.system(size: 10)).foregroundStyle(locked ? G.goldDim : G.greyDark)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer()
                        if !locked {
                            Button("LOCK") { session.lockEraFilter() }
                                .font(.system(size: 10, weight: .semibold)).tracking(2)
                                .foregroundStyle(isCustomRange ? G.gold : G.greyDark)
                                .padding(.horizontal, 12).padding(.vertical, 4)
                                .background(isCustomRange ? G.gold.opacity(0.13) : Color.clear)
                                .overlay(Rectangle().stroke(isCustomRange ? G.gold.opacity(0.4) : G.border, lineWidth: 1))
                                .buttonStyle(.plain).disabled(!isCustomRange)
                        }
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8)
                }
            }
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    // MARK: Court

    private let benchMinutes: [String: Int] = ["B1": 25, "B2": 15, "B3": 13, "B4": 12]

    private var court: some View {
        VStack(spacing: 14) {
            // Starting Five — 3-2 formation
            VStack(spacing: 2) {
                Text("STARTING FIVE").font(.system(size: 11, weight: .semibold)).tracking(3).foregroundStyle(G.greyDark)
                Text("STARTERS · 35 MIN EACH").font(.system(size: 9)).tracking(1).foregroundStyle(G.greyDark.opacity(0.6))
            }
            VStack(spacing: 6) {
                HStack(spacing: 6) { ForEach(starters.prefix(3)) { slot in courtCell(slot) } }
                HStack(spacing: 6) { ForEach(starters.dropFirst(3)) { slot in courtCell(slot) } }
                    .frame(width: max(160, (courtWidth - 28) * 0.66))  // 66.7% centered (VStack centers)
            }

            EraBallDivider()

            Text("BENCH").font(.system(size: 11, weight: .semibold)).tracking(3).foregroundStyle(G.greyDark)
            HStack(spacing: 6) { ForEach(bench) { slot in Text("\(benchMinutes[slot.position] ?? 0) MIN").font(.system(size: 9)).tracking(0.8).foregroundStyle(.white.opacity(0.35)).frame(maxWidth: .infinity) } }
            HStack(spacing: 6) { ForEach(bench) { slot in courtCell(slot) } }
        }
        .padding(14).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
        .background(GeometryReader { g in Color.clear.onAppear { courtWidth = g.size.width }.onChange(of: g.size.width) { _, w in courtWidth = w } })
    }

    private func courtCell(_ slot: SlotVM) -> some View {
        CourtSlotCell(
            slot: slot,
            fit: fitFor(slot),
            pending: session.pendingSlotIndex == slot.index ? session.selectedPoolPlayer : nil,
            simEra: session.selectedEra ?? "20s",
            onTap: { tapSlot(slot) }
        )
    }

    private func fitFor(_ slot: SlotVM) -> EngineBridge.FitInfo? {
        guard slot.player == nil, session.selectedPoolPlayer != nil else { return nil }
        return session.selectedFits[slot.position]
    }
    private func tapSlot(_ slot: SlotVM) {
        if slot.player != nil { viewSlotPlayer = slot.player }
        else if session.selectedPoolPlayer != nil { session.previewSlot(slot.index) }
    }

    private var capMeter: some View {
        HStack(spacing: 12) {
            ForEach(["s", "a", "b", "c", "d"], id: \.self) { tier in
                let used = state?.tierCounts[tier] ?? 0
                let quota = state?.capQuotas[tier] ?? 0
                VStack(spacing: 2) {
                    Text(tier.uppercased()).font(.system(size: 12, weight: .black)).foregroundStyle(tierColor(tier))
                    Text("\(used)/\(quota)").font(.system(size: 11, weight: .semibold, design: .monospaced)).foregroundStyle(used >= quota ? G.green : G.grey)
                }.frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, 10).padding(.horizontal, 16).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private var spinSection: some View {
        VStack(spacing: 12) {
            if session.draftSpinning || !session.spinTeamDisplay.isEmpty {
                HStack(spacing: 14) {
                    SpinReel(text: session.spinTeamDisplay, spinning: session.draftSpinning, color: G.gold)
                    SpinReel(text: eraDisplayLabel(session.spinEraDisplay).uppercased(), spinning: session.draftSpinning, color: G.white)
                }.frame(height: 56)
            }
            if session.noPlayersMessage { Text("No available players on that roster — spin again").font(.footnote).foregroundStyle(Color(hex: "#fb923c")) }
            if let v = session.capViolation { Text(v).font(.footnote).foregroundStyle(G.red) }
            if !session.draftComplete {
                Button { session.spinDraft() } label: {
                    HStack(spacing: 8) { Image(systemName: "dice.fill"); Text(session.draftSpinning ? "SPINNING…" : (session.pool.isEmpty ? "SPIN TEAM + ERA" : "RE-SPIN")) }
                }
                .buttonStyle(GoldButtonStyle(fullWidth: true)).disabled(!session.canSpin)
                if !session.pool.isEmpty && !session.draftSpinning {
                    Text(session.respinUsed ? "NO RE-SPINS LEFT · PICK FROM THIS ROSTER" : "1 RE-SPIN REMAINING THIS DRAFT")
                        .font(.system(size: 9, weight: .semibold)).tracking(1.8).foregroundStyle(session.respinUsed ? G.grey : G.goldDim)
                }
                #if DEBUG
                Button("DEV · FILL ROSTER") { session.devFillRoster() }.buttonStyle(.plain)
                    .font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundStyle(G.greyDark)
                    .padding(.horizontal, 10).padding(.vertical, 4).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                #endif
            }
        }
    }

    // Inline selected-player card + placement hint (web: selectedPlayer block).
    private func selectedBlock(_ p: PlayerVM) -> some View {
        VStack(spacing: 8) {
            HStack {
                Text("↑ TAP AN EMPTY SLOT TO PLACE").font(.system(size: 10, weight: .bold)).tracking(1.5).foregroundStyle(G.gold)
                Spacer()
                Button("CLEAR") { session.selectPoolPlayer(nil) }.buttonStyle(.plain).font(.system(size: 10, weight: .semibold)).foregroundStyle(G.grey)
            }
            PlayerCardView(player: p)
        }
        .padding(10).background(G.gold.opacity(0.05)).overlay(Rectangle().stroke(G.gold.opacity(0.4), lineWidth: 1))
    }

    private var poolList: some View {
        VStack(spacing: 8) {
            HStack {
                SectionHeader(title: "\(session.spinTeamDisplay) · \(eraDisplayLabel(session.spinEraDisplay).uppercased()) (\(displayPool.count))")
                Spacer()
                Menu {
                    ForEach(PoolSort.allCases, id: \.self) { s in Button(s.rawValue) { sortBy = s } }
                } label: {
                    HStack(spacing: 4) { Image(systemName: "arrow.up.arrow.down"); Text(sortBy.rawValue) }
                        .font(.system(size: 10, weight: .semibold)).foregroundStyle(G.gold)
                }
            }
            // Position filter chips
            HStack(spacing: 6) {
                ForEach(["G", "F", "C"], id: \.self) { pos in
                    Button { posFilter = posFilter == pos ? nil : pos } label: {
                        Text(pos).font(.system(size: 11, weight: .bold))
                            .foregroundStyle(posFilter == pos ? G.gold : G.greyDark)
                            .frame(width: 34, height: 24)
                            .background(posFilter == pos ? G.gold.opacity(0.13) : Color.clear)
                            .overlay(Rectangle().stroke(posFilter == pos ? G.gold : G.border, lineWidth: 1))
                    }.buttonStyle(.plain)
                }
                Spacer()
            }
            // Contained, self-scrolling roster box (web parity) — the header/chips above
            // stay pinned; only this list scrolls, so the court stays in view.
            ScrollView(.vertical, showsIndicators: true) {
                LazyVStack(spacing: 6) {
                    ForEach(displayPool) { p in
                        Button { session.selectPoolPlayer(session.selectedPoolPlayer?.personId == p.personId ? nil : p) } label: {
                            PoolRow(player: p, selected: session.selectedPoolPlayer?.personId == p.personId)
                        }.buttonStyle(.plain)
                    }
                }
                .padding(8)
            }
            .frame(height: 360)
            .background(G.surface.opacity(0.5))
            .overlay(Rectangle().stroke(G.border, lineWidth: 1))
            .overlay(alignment: .bottom) {
                // Soft scroll-edge fade so rows dissolve under the box's bottom border.
                LinearGradient(colors: [.clear, G.black.opacity(0.6)], startPoint: .top, endPoint: .bottom)
                    .frame(height: 24).allowsHitTesting(false)
            }
        }
    }

}

// MARK: - Player Tag Effects reference sheet (port of DraftScreen.tsx "Player Tag Effects")

struct TagEffectsSheet: View {
    @Environment(\.dismiss) private var dismiss

    private struct Tag: Identifiable { let name: String; let color: Color; let desc: String; var id: String { name } }
    private let tags: [Tag] = [
        .init(name: "Champion",      color: G.gold,               desc: "Elevates their game in the playoffs. The more championships, the bigger the boost."),
        .init(name: "Def Anchor",    color: Color(hex: "#4A9ECC"), desc: "Defensive impact beyond the stat sheet. T1 carries a larger boost than T2."),
        .init(name: "Off Anchor",    color: G.gold,               desc: "Elevates the team's offense. T1 carries a larger boost than T2."),
        .init(name: "Floor General", color: Color(hex: "#E0D4FF"), desc: "Elite playmaker. Boosts team ball movement. Stacks with a second Floor General (capped at 2)."),
        .init(name: "Flex",          color: Color(hex: "#4A9ECC"), desc: "Fits multiple positions without penalty."),
        .init(name: "Shooting Star", color: Color(hex: "#F472B6"), desc: "Boosts team spacing. All-time shooters. T1 carries a larger boost than T2."),
        .init(name: "Glass Cleaner", color: Color(hex: "#34D399"), desc: "Elite rebounder. Boosts team second-chance points and limits opponent possessions."),
        .init(name: "Timeless",      color: Color(hex: "#C084FC"), desc: "Minimal era penalties across all decades. Minor penalty only if 6+ eras from home."),
        .init(name: "Dynamic Duo",   color: Color(hex: "#4ECDC4"), desc: "Draft both players to activate a +5 rating boost for each. Check the tooltip to see who the partner is."),
        .init(name: "Sixth Man",     color: Color(hex: "#FF8C42"), desc: "Elite bench performer. Gets a +5 rating boost when playing off the bench. No effect when starting."),
        .init(name: "Finals MVP",    color: Color(hex: "#FFD700"), desc: "Proven performer on the biggest stage. Gets a boost in Finals games. 3+ have a larger boost than 1-2."),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 2).fill(G.gold).frame(width: 3, height: 14)
                    Text("PLAYER TAG EFFECTS").font(.system(size: 12, weight: .bold)).tracking(3).foregroundStyle(G.gold)
                    Spacer()
                    Button { dismiss() } label: {
                        Image(systemName: "xmark").font(.system(size: 12, weight: .bold)).foregroundStyle(G.grey)
                            .frame(width: 30, height: 30)
                    }
                    .buttonStyle(.plain)
                    .glassEffect(.regular.interactive(), in: .circle)
                }
                .padding(.bottom, 2)

                GlassEffectContainer(spacing: 8) {
                    VStack(spacing: 8) {
                        ForEach(tags) { t in
                            HStack(alignment: .top, spacing: 10) {
                                Text(t.name.uppercased()).font(.system(size: 11, weight: .bold)).tracking(0.5)
                                    .foregroundStyle(t.color).frame(width: 92, alignment: .leading)
                                Text(t.desc).font(.system(size: 12)).lineSpacing(2).foregroundStyle(Color(hex: "#c8c8c8"))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .padding(.horizontal, 12).padding(.vertical, 10)
                            .overlay(alignment: .leading) { Rectangle().fill(t.color).frame(width: 2) }
                            .glassEffect(.regular.tint(t.color.opacity(0.10)), in: .rect(cornerRadius: 10))
                        }
                    }
                }

                Text("Scoring isn't everything. Defense, playmaking, and rebounding all shape your season.")
                    .font(.system(size: 12)).italic().foregroundStyle(G.grey.opacity(0.8))
                    .multilineTextAlignment(.center).frame(maxWidth: .infinity).padding(.top, 6)
            }
            .padding(16)
        }
        .scrollContentBackground(.hidden)
        .presentationDetents([.medium, .large])
        .presentationBackground(.clear)
        .presentationDragIndicator(.visible)
        .preferredColorScheme(.dark)
    }
}

// MARK: - Court slot cell (port of CourtSlotView)

struct CourtSlotCell: View {
    let slot: SlotVM
    let fit: EngineBridge.FitInfo?   // fit of the selected pool player for this empty slot
    var pending: PlayerVM? = nil     // player tentatively placed here (tap again to lock)
    var simEra: String = "20s"
    let onTap: () -> Void

    private func fitLabelColor(_ pen: Double) -> Color { pen == 0 ? G.gold : pen >= 0.25 ? G.red : G.grey }
    private var glowColor: Color? {
        guard let fit else { return nil }
        if fit.penalty >= 0.25 { return Color(hex: "#7A2020") }
        if fit.penalty >= 0.10 { return Color(hex: "#8B6914") }
        return G.gold
    }

    var body: some View {
        Button(action: onTap) {
            ZStack(alignment: .topLeading) {
                content
                Text(slot.position).font(Fonts.bebas(15)).foregroundStyle(G.goldDim).padding(6)
                if let fit, slot.player == nil, pending == nil {
                    Text(fit.penalty == 0 ? "✓" : fit.penalty >= 0.25 ? "−25%" : "−10%")
                        .font(.system(size: 9, weight: .bold)).foregroundStyle(fitLabelColor(fit.penalty))
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing).padding(6)
                }
                if slot.player != nil, let label = slot.fitLabel, label != "Position Fit" {
                    Text(slot.fitPenalty >= 0.25 ? "−25%" : "−10%").font(.system(size: 8, weight: .bold)).foregroundStyle(slot.fitPenalty >= 0.25 ? G.red : G.grey)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing).padding(6)
                }
            }
            .frame(maxWidth: .infinity).frame(minHeight: 130)
            .background(bg).overlay { if let p = slot.player { TierShine(base: p.base) } }
            .overlay(Rectangle().stroke(border, lineWidth: 1))
            .shadow(color: (glowColor ?? .clear).opacity(fit?.penalty == 0 ? 0.7 : 0.3), radius: fit != nil ? 10 : 0)
            .clipped()
        }.buttonStyle(.plain)
    }

    @ViewBuilder private var content: some View {
        if let p = slot.player ?? pending {
            VStack(spacing: 3) {
                PlayerHeadshotView(personId: p.personId, initial: p.fullName, size: 50)
                Text(p.fullName).font(.system(size: 11, weight: .semibold)).lineLimit(1).minimumScaleFactor(0.7).foregroundStyle(G.white)
                Text("\(p.position.uppercased()) · \(eraDisplayLabel(p.era))").font(.system(size: 9)).foregroundStyle(G.grey).lineLimit(1)
                Text("\(Int(p.PTS.rounded()))/\(Int(p.REB.rounded()))/\(Int(p.AST.rounded()))").font(.system(size: 10, weight: .bold)).foregroundStyle(G.gold)
                Text("ERA FIT \(Int((p.eraModifier * 100).rounded()))%").font(.system(size: 8)).tracking(0.4)
                    .foregroundStyle(p.eraModifier >= 1.0 ? G.gold : p.eraModifier < 0.75 ? G.red : G.grey)
                if pending != nil {
                    Text("PENDING · TAP TO LOCK \(slot.position)").font(.system(size: 8, weight: .semibold)).tracking(0.4)
                        .foregroundStyle(G.goldDim).multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 4).padding(.top, 22).padding(.bottom, 8)
        } else {
            Text(fit != nil ? "+ place here" : "—")
                .font(.system(size: 11)).foregroundStyle(fit != nil ? (glowColor ?? G.goldDim) : G.greyDark)
                .frame(maxWidth: .infinity, minHeight: 130)
        }
    }

    private var bg: AnyShapeStyle {
        if let p = slot.player { return AnyShapeStyle(tierBackground(base: p.base)) }
        if pending != nil { return AnyShapeStyle(G.gold.opacity(0.04)) }
        return AnyShapeStyle(G.black)
    }
    private var border: Color {
        if let p = slot.player { return tierBorderColor(base: p.base) }
        if pending != nil { return G.goldDim }
        return glowColor ?? G.border
    }
}

struct PoolRow: View {
    let player: PlayerVM
    var selected: Bool = false
    var body: some View {
        HStack(spacing: 12) {
            PlayerHeadshotView(personId: player.personId, initial: player.fullName, size: 44)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(player.fullName).font(.system(size: 14, weight: .bold)).lineLimit(1).foregroundStyle(G.white)
                    if player.greatest75 { Image(systemName: "star.fill").font(.system(size: 8)).foregroundStyle(G.gold) }
                }
                HStack(spacing: 5) { ForEach(player.tags.prefix(3)) { TagChip(tag: $0) } }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 1) {
                Text(String(format: "%.1f", player.PTS)).font(.system(size: 16, weight: .black, design: .rounded)).foregroundStyle(G.white)
                Text("PPG").font(.system(size: 8, weight: .semibold)).foregroundStyle(G.grey)
            }
            Text(player.tier.uppercased()).font(.system(size: 13, weight: .black, design: .rounded)).foregroundStyle(tierColor(player.tier))
                .frame(width: 26, height: 26).overlay(Rectangle().stroke(tierColor(player.tier).opacity(0.4), lineWidth: 1))
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(selected ? G.gold.opacity(0.12) : G.surface)
        .overlay(Rectangle().stroke(selected ? G.gold : G.border, lineWidth: selected ? 1.5 : 1))
    }
}

/// Slot-reel text: flickers while spinning, snaps on land.
struct SpinReel: View {
    let text: String
    let spinning: Bool
    var color: Color = .white
    var body: some View {
        Text(text.isEmpty ? "———" : text)
            .font(Fonts.bebas(40)).foregroundStyle(spinning ? color.opacity(0.45) : color)
            .contentTransition(.numericText()).animation(.snappy(duration: 0.12), value: text)
            .blur(radius: spinning ? 1 : 0).lineLimit(1).minimumScaleFactor(0.5)
    }
}
