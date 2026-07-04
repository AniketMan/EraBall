// DraftView.swift -- port of app/features/draft/DraftScreen.tsx
// Flow: spin -> pool. Tap a pool player to SELECT (shows the full card); empty court
// slots glow with a fit badge -- tap an empty slot to PLACE the selected player.
// Includes: era filter panel, bench MPG labels, tag key section.
import SwiftUI

private let ALL_ERAS_ORDERED = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]
private let SLOT_MPG: [String: Int] = ["B1": 25, "B2": 15, "B3": 13, "B4": 12]

struct DraftView: View {
    @Environment(GameSession.self) private var session
    @Environment(AudioManager.self) private var audio
    @State private var viewSlotPlayer: PlayerVM?
    @State private var showEraFilter = false

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
                    tagKeySection
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
                                if let idx = state?.slots.first(where: { $0.player?.personId == p.personId })?.index {
                                    session.remove(slotIndex: idx)
                                }
                                viewSlotPlayer = nil
                            }
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("CLOSE") { viewSlotPlayer = nil }.foregroundStyle(G.gold)
                        }
                    }
            }
            .presentationDetents([.medium, .large]).preferredColorScheme(.dark)
        }
        .onAppear { if let e = session.selectedEra { audio.play(era: e) } }
    }

    // MARK: - Top Bar
    private var topBar: some View {
        HStack {
            Button { session.restart() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 15, weight: .semibold)).foregroundStyle(G.grey)
                    .frame(width: 34, height: 34).overlay(Rectangle().stroke(G.border, lineWidth: 1))
            }.buttonStyle(.plain)
            Spacer()
            VStack(spacing: 2) {
                Text(session.salaryCapMode ? "SALARY CAP DRAFT" : "PLAYER DRAFT")
                    .font(.system(size: 13, weight: .bold)).tracking(2.5)
                    .foregroundStyle(session.salaryCapMode ? G.purple : G.gold)
                Text("SIM ERA \u{00B7} \(eraDisplayLabel(session.selectedEra ?? "").uppercased())")
                    .font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
            }
            Spacer()
            Text("\(state?.filledCount ?? 0)/9")
                .font(.system(size: 13, weight: .bold, design: .monospaced)).foregroundStyle(G.grey)
                .frame(width: 34)
        }
        .padding(.horizontal, 16).padding(.vertical, 10)
        .overlay(alignment: .bottom) { EraBallDivider() }
    }

    // MARK: - Court
    private var court: some View {
        VStack(spacing: 10) {
            // Starters header
            VStack(spacing: 2) {
                SectionHeader(title: "Starting Five")
                Text("Starters - 35 min each")
                    .font(.system(size: 10)).tracking(1).foregroundStyle(G.greyDark.opacity(0.6))
            }
            // 3 starters top row
            HStack(spacing: 6) {
                ForEach(starters.prefix(3)) { slot in
                    CourtSlotCell(slot: slot, fit: fitFor(slot), onTap: { tapSlot(slot) })
                }
            }
            // 2 starters bottom row (centered at 2/3 width)
            GeometryReader { geo in
                HStack(spacing: 6) {
                    ForEach(Array(starters.dropFirst(3).prefix(2))) { slot in
                        CourtSlotCell(slot: slot, fit: fitFor(slot), onTap: { tapSlot(slot) })
                    }
                }
                .frame(width: geo.size.width * 2 / 3)
                .frame(maxWidth: .infinity)
            }
            .frame(height: 108)
            EraBallDivider()
            // Bench header
            Text("BENCH")
                .font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.greyDark)
                .frame(maxWidth: .infinity, alignment: .center)
            // Bench MPG labels
            HStack(spacing: 6) {
                ForEach(bench) { slot in
                    Text("\(SLOT_MPG[slot.position] ?? 0) MIN")
                        .font(.system(size: 9)).tracking(1).foregroundStyle(G.white.opacity(0.35))
                        .frame(maxWidth: .infinity)
                }
            }
            // Bench slots
            HStack(spacing: 6) {
                ForEach(bench) { slot in
                    CourtSlotCell(slot: slot, fit: fitFor(slot), onTap: { tapSlot(slot) })
                }
            }
        }
        .padding(16).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private func fitFor(_ slot: SlotVM) -> EngineBridge.FitInfo? {
        guard slot.player == nil, session.selectedPoolPlayer != nil else { return nil }
        return session.selectedFits[slot.position]
    }

    private func tapSlot(_ slot: SlotVM) {
        if slot.player != nil { viewSlotPlayer = slot.player }
        else if session.selectedPoolPlayer != nil { session.placeSelected(atSlotIndex: slot.index) }
    }

    // MARK: - Salary Cap Meter
    private var capMeter: some View {
        HStack(spacing: 12) {
            ForEach(["s", "a", "b", "c", "d"], id: \.self) { tier in
                let used = state?.tierCounts[tier] ?? 0
                let quota = state?.capQuotas[tier] ?? 0
                VStack(spacing: 2) {
                    Text(tier.uppercased()).font(.system(size: 12, weight: .black)).foregroundStyle(tierColor(tier))
                    Text("\(used)/\(quota)")
                        .font(.system(size: 11, weight: .semibold, design: .monospaced))
                        .foregroundStyle(used >= quota ? G.green : G.grey)
                }.frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, 10).padding(.horizontal, 16)
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    // MARK: - Era Filter Panel
    private var eraFilterPanel: some View {
        let locked = session.eraFilterLocked
        let isCustomRange = session.eraFilter.count < ALL_ERAS_ORDERED.count
        return VStack(spacing: 0) {
            // Toggle button
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

            // Collapsible panel
            if showEraFilter || (locked && isCustomRange) {
                VStack(spacing: 0) {
                    // Era toggle chips
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
                        .buttonStyle(.plain)
                        .disabled(locked)
                    }
                    .padding(.horizontal, 8).padding(.top, 4).padding(.bottom, 2)

                    // Lock row
                    HStack(spacing: 12) {
                        Text(locked
                             ? "Locked. Excluding \(ALL_ERAS_ORDERED.count - session.eraFilter.count) era\(ALL_ERAS_ORDERED.count - session.eraFilter.count != 1 ? "s" : ""). Not eligible for leaderboard."
                             : "Select eras, then lock to apply.")
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
                                .buttonStyle(.plain)
                                .disabled(!isCustomRange)
                        }
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8)
                }
            }
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    // MARK: - Spin Section
    private var spinSection: some View {
        VStack(spacing: 12) {
            if session.draftSpinning || !session.spinTeamDisplay.isEmpty {
                HStack(spacing: 14) {
                    SpinReel(text: session.spinTeamDisplay, spinning: session.draftSpinning, color: G.gold)
                    SpinReel(text: eraDisplayLabel(session.spinEraDisplay).uppercased(), spinning: session.draftSpinning, color: G.white)
                }.frame(height: 56)
            }
            if session.noPlayersMessage {
                Text("No available players on that roster -- spin again")
                    .font(.footnote).foregroundStyle(Color(hex: "#fb923c"))
            }
            if let v = session.capViolation {
                Text(v).font(.footnote).foregroundStyle(G.red)
            }
            if !session.draftComplete {
                Button {
                    session.spinDraft()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "dice.fill")
                        Text(session.draftSpinning ? "SPINNING..." : (session.pool.isEmpty ? "SPIN TEAM + ERA" : "RE-SPIN"))
                    }
                }
                .buttonStyle(GoldButtonStyle(fullWidth: true))
                .disabled(!session.canSpin)

                if !session.pool.isEmpty && !session.draftSpinning {
                    Text(session.respinUsed
                         ? "NO RE-SPINS LEFT \u{00B7} PICK FROM THIS ROSTER"
                         : "1 RE-SPIN REMAINING THIS DRAFT")
                        .font(.system(size: 9, weight: .semibold)).tracking(1.8)
                        .foregroundStyle(session.respinUsed ? G.grey : G.goldDim)
                }
            }
        }
    }

    // MARK: - Selected Player Block
    private func selectedBlock(_ p: PlayerVM) -> some View {
        VStack(spacing: 8) {
            HStack {
                Text("\u{2191} TAP AN EMPTY SLOT TO PLACE")
                    .font(.system(size: 10, weight: .bold)).tracking(1.5).foregroundStyle(G.gold)
                Spacer()
                Button("CLEAR") { session.selectPoolPlayer(nil) }
                    .buttonStyle(.plain).font(.system(size: 10, weight: .semibold)).foregroundStyle(G.grey)
            }
            PlayerCardView(player: p)
        }
        .padding(10).background(G.gold.opacity(0.05)).overlay(Rectangle().stroke(G.gold.opacity(0.4), lineWidth: 1))
    }

    // MARK: - Pool List
    private var poolList: some View {
        VStack(spacing: 8) {
            SectionHeader(title: "\(session.spinTeamDisplay) \u{00B7} \(eraDisplayLabel(session.spinEraDisplay).uppercased()) roster (\(session.pool.count))")
            LazyVStack(spacing: 6) {
                ForEach(session.pool) { p in
                    Button {
                        session.selectPoolPlayer(session.selectedPoolPlayer?.personId == p.personId ? nil : p)
                    } label: {
                        PoolRow(player: p, selected: session.selectedPoolPlayer?.personId == p.personId)
                    }.buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Tag Key Section
    private var tagKeySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Rectangle().fill(G.gold).frame(width: 3, height: 14)
                Text("PLAYER TAG EFFECTS")
                    .font(.system(size: 10, weight: .bold)).tracking(3).foregroundStyle(G.gold)
            }
            VStack(spacing: 4) {
                ForEach(tagKeyItems, id: \.name) { item in
                    HStack(alignment: .top, spacing: 10) {
                        Text(item.name)
                            .font(.system(size: 9, weight: .bold)).tracking(1)
                            .foregroundStyle(item.color)
                            .frame(width: 90, alignment: .leading)
                        Text(item.desc)
                            .font(.system(size: 10)).foregroundStyle(Color(hex: "#b4b4b4"))
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer()
                    }
                    .padding(.horizontal, 10).padding(.vertical, 6)
                    .background(item.color.opacity(0.06))
                    .overlay(alignment: .leading) {
                        Rectangle().fill(item.color).frame(width: 2)
                    }
                }
            }
            Text("Scoring isn't everything. Defense, playmaking, and rebounding all shape your season.")
                .font(.system(size: 10)).italic().foregroundStyle(G.grey.opacity(0.75))
                .multilineTextAlignment(.center).frame(maxWidth: .infinity)
                .padding(.top, 4)
        }
        .padding(16)
        .background(
            LinearGradient(colors: [Color(hex: "#111111"), Color(hex: "#0b0b0b")],
                           startPoint: UnitPoint(x: 0.2, y: 0), endPoint: UnitPoint(x: 1, y: 1))
        )
        .overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private struct TagKeyItem {
        let name: String
        let color: Color
        let desc: String
    }

    private var tagKeyItems: [TagKeyItem] { [
        TagKeyItem(name: "Champion",      color: G.gold,                desc: "Elevates their game in the playoffs. The more championships, the bigger the boost."),
        TagKeyItem(name: "Def Anchor",    color: Color(hex: "#4A9ECC"), desc: "Defensive impact beyond the stat sheet. T1 carries a larger boost than T2."),
        TagKeyItem(name: "Off Anchor",    color: G.gold,                desc: "Elevates the team's offense. T1 carries a larger boost than T2."),
        TagKeyItem(name: "Floor General", color: Color(hex: "#E0D4FF"), desc: "Elite playmaker. Boosts team ball movement. Stacks with a second Floor General (capped at 2)."),
        TagKeyItem(name: "Flex",          color: Color(hex: "#4A9ECC"), desc: "Fits multiple positions without penalty."),
        TagKeyItem(name: "Shooting Star", color: G.pink,                desc: "Boosts team spacing. All-time shooters. T1 carries a larger boost than T2."),
        TagKeyItem(name: "Glass Cleaner", color: G.green,               desc: "Elite rebounder. Boosts team second-chance points and limits opponent possessions."),
        TagKeyItem(name: "Timeless",      color: Color(hex: "#C084FC"), desc: "Minimal era penalties across all decades. Minor penalty only if 6+ eras from home."),
        TagKeyItem(name: "Dynamic Duo",   color: G.teal,                desc: "Draft both players to activate a +5 rating boost for each. Check the tooltip to see who the partner is."),
        TagKeyItem(name: "Sixth Man",     color: Color(hex: "#FF8C42"), desc: "Elite bench performer. Gets a +5 rating boost when playing off the bench. No effect when starting."),
        TagKeyItem(name: "Finals MVP",    color: Color(hex: "#FFD700"), desc: "Proven performer on the biggest stage. Gets a boost in Finals games. 3+ have a larger boost than 1-2."),
    ] }
}

// MARK: - Court Slot Cell (port of CourtSlotView)
struct CourtSlotCell: View {
    let slot: SlotVM
    let fit: EngineBridge.FitInfo?
    let onTap: () -> Void

    private var placedFitColor: Color {
        if slot.fitPenalty >= 0.25 { return G.red }
        if slot.fitPenalty >= 0.10 { return G.grey }
        return G.gold
    }
    private var glowColor: Color? {
        guard let fit else { return nil }
        if fit.penalty >= 0.25 { return G.red }
        if fit.penalty >= 0.10 { return Color(hex: "#8B6914") }
        return G.gold
    }

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                if let p = slot.player {
                    PlayerHeadshotView(personId: p.personId, initial: p.fullName, size: 42)
                    Text(p.fullName.split(separator: " ").last.map(String.init) ?? p.fullName)
                        .font(.system(size: 9, weight: .semibold)).lineLimit(1).minimumScaleFactor(0.7).foregroundStyle(G.white)
                    Text("\(Int(p.PTS.rounded()))/\(Int(p.REB.rounded()))/\(Int(p.AST.rounded()))")
                        .font(.system(size: 9, weight: .bold)).foregroundStyle(G.gold)
                    if let label = slot.fitLabel, label != "Position Fit" {
                        Text(slot.fitPenalty >= 0.25 ? "-25%" : "-10%")
                            .font(.system(size: 8)).foregroundStyle(placedFitColor)
                    }
                } else {
                    Text(fit != nil ? (fit!.penalty == 0 ? "\u{2713}" : fit!.penalty >= 0.25 ? "-25%" : "-10%") : " ")
                        .font(.system(size: 9, weight: .bold)).foregroundStyle(glowColor ?? .clear)
                        .frame(height: 12)
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(fit != nil ? (glowColor ?? G.goldDim) : G.border)
                        .frame(height: 30)
                    Text(fit != nil ? "PLACE" : " ")
                        .font(.system(size: 8, weight: .semibold)).foregroundStyle(glowColor ?? .clear)
                }
            }
            .frame(maxWidth: .infinity).frame(minHeight: 96).padding(.vertical, 6)
            .overlay(alignment: .topLeading) {
                Text(slot.position).font(Fonts.bebas(13)).foregroundStyle(G.goldDim).padding(4)
            }
            .background(slot.player != nil ? AnyShapeStyle(tierBackground(base: slot.player!.base)) : AnyShapeStyle(G.black))
            .overlay { if let p = slot.player { TierShine(base: p.base) } }
            .overlay(Rectangle().stroke(slotBorder, lineWidth: 1))
            .clipped()
            .shadow(color: (glowColor ?? .clear).opacity(fit != nil && fit!.penalty == 0 ? 0.7 : 0.25), radius: fit != nil ? 8 : 0)
        }.buttonStyle(.plain)
    }

    private var slotBorder: Color {
        if let p = slot.player { return tierBorderColor(base: p.base) }
        return glowColor ?? G.border
    }
}

// MARK: - Pool Row
struct PoolRow: View {
    let player: PlayerVM
    var selected: Bool = false

    var body: some View {
        HStack(spacing: 12) {
            PlayerHeadshotView(personId: player.personId, initial: player.fullName, size: 44)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(player.fullName)
                        .font(.system(size: 14, weight: .bold)).lineLimit(1).foregroundStyle(G.white)
                    if player.greatest75 {
                        Image(systemName: "star.fill").font(.system(size: 8)).foregroundStyle(G.gold)
                    }
                }
                HStack(spacing: 5) { ForEach(player.tags.prefix(3)) { TagChip(tag: $0) } }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 1) {
                Text(String(format: "%.1f", player.PTS))
                    .font(.system(size: 16, weight: .black, design: .rounded)).foregroundStyle(G.white)
                Text("PPG").font(.system(size: 8, weight: .semibold)).foregroundStyle(G.grey)
            }
            Text(player.tier.uppercased())
                .font(.system(size: 13, weight: .black, design: .rounded))
                .foregroundStyle(tierColor(player.tier))
                .frame(width: 26, height: 26)
                .overlay(Rectangle().stroke(tierColor(player.tier).opacity(0.4), lineWidth: 1))
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(selected ? G.gold.opacity(0.12) : G.surface)
        .overlay(Rectangle().stroke(selected ? G.gold : G.border, lineWidth: selected ? 1.5 : 1))
    }
}

// MARK: - Spin Reel
/// Slot-reel text: flickers while spinning, snaps on land.
struct SpinReel: View {
    let text: String
    let spinning: Bool
    var color: Color = .white

    var body: some View {
        Text(text.isEmpty ? "---" : text)
            .font(Fonts.bebas(40)).foregroundStyle(spinning ? color.opacity(0.45) : color)
            .contentTransition(.numericText()).animation(.snappy(duration: 0.12), value: text)
            .blur(radius: spinning ? 1 : 0).lineLimit(1).minimumScaleFactor(0.5)
    }
}
