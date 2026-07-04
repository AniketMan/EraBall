// PlayerCardView.swift — port of app/_shared/PlayerCard.tsx
// Full draft-pool player card: tier-gradient background, headshot + name + tags,
// big-three (gold), secondary stat grids, seasons line.
import SwiftUI

/// Tier gradient background by base rating (port of src/lib/ui.ts tierBg).
func tierBackground(base: Double) -> LinearGradient {
    let stops: [Color]
    switch base {
    case 55...:  stops = [Color(hex: "#0f0620"), Color(hex: "#1e0c3d"), Color(hex: "#130826"), Color(hex: "#0a0415")]
    case 46..<55: stops = [Color(hex: "#2e2000"), Color(hex: "#6b4800"), Color(hex: "#3e2a00"), Color(hex: "#1c1200")]
    case 38..<46: stops = [Color(hex: "#001508"), Color(hex: "#002d12"), Color(hex: "#001c0a"), Color(hex: "#000e05")]
    case 31..<38: stops = [Color(hex: "#040e1c"), Color(hex: "#0a1e3a"), Color(hex: "#061428"), Color(hex: "#020810")]
    case 24..<31: stops = [Color(hex: "#1a0900"), Color(hex: "#2e1200"), Color(hex: "#1e0c00"), Color(hex: "#100600")]
    case 16..<24: stops = [Color(hex: "#0e0e0e"), Color(hex: "#181818"), Color(hex: "#0e0e0e"), Color(hex: "#0e0e0e")]
    default:     stops = [Color(hex: "#0a0a0a"), Color(hex: "#0a0a0a")]
    }
    return LinearGradient(colors: stops, startPoint: .topLeading, endPoint: .bottomTrailing)
}

/// Animated tier shine — sheen beam sweep + twinkling sparkles.
/// Port of globals.css .card-sheen-beam + .card-{gold,amethyst}-sparkles.
/// tier "s" = amethyst, "a" = gold; nothing for lower tiers.
struct TierShine: View {
    let base: Double
    private var isS: Bool { base >= 55 }
    private var isA: Bool { base >= 46 && base < 55 }

    // Fixed sparkle positions (fraction of card) + delay, matching the CSS nth-child.
    private let sparks: [(x: CGFloat, y: CGFloat, delay: Double)] = [
        (0.08, 0.15, 0.0), (0.72, 0.55, 0.3), (0.90, 0.30, 0.7), (0.38, 0.74, 1.1), (0.88, 0.08, 1.5),
        (0.78, 0.85, 0.2), (0.06, 0.45, 0.9), (0.92, 0.65, 0.5), (0.92, 0.22, 1.7), (0.55, 0.90, 1.3),
    ]

    var body: some View {
        if isS || isA {
            GeometryReader { geo in
                TimelineView(.animation) { tl in
                    let t = tl.date.timeIntervalSinceReferenceDate
                    ZStack {
                        sheen(width: geo.size.width, height: geo.size.height, t: t)
                        ForEach(sparks.indices, id: \.self) { i in
                            let s = sparks[i]
                            let phase = ((t - s.delay).truncatingRemainder(dividingBy: 2.0) + 2.0)
                                .truncatingRemainder(dividingBy: 2.0) / 2.0
                            let env = max(0, sin(phase * .pi))  // 0→1→0 over 2s
                            Circle()
                                .fill(sparkColor.opacity(0.4 * env))
                                .frame(width: 3, height: 3)
                                .scaleEffect(0.4 + 0.6 * env)
                                .shadow(color: sparkGlow.opacity(env), radius: 3)
                                .position(x: s.x * geo.size.width, y: s.y * geo.size.height)
                        }
                    }
                }
            }
            .allowsHitTesting(false)
        }
    }

    private func sheen(width W: CGFloat, height H: CGFloat, t: TimeInterval) -> some View {
        let period = 5.0
        let p = t.truncatingRemainder(dividingBy: period) / period
        let beamW = W * 0.45
        // translateX -150%..350% of beam width over first 35% of cycle, then parked.
        let txFrac: CGFloat = p < 0.35 ? -1.5 + 5.0 * CGFloat(p / 0.35) : 3.5
        let opacity: CGFloat = p < 0.08 ? CGFloat(p / 0.08)
            : p < 0.35 ? 1 - CGFloat((p - 0.08) / 0.27) : 0
        return Rectangle()
            .fill(LinearGradient(stops: [
                .init(color: .white.opacity(0), location: 0),
                .init(color: .white.opacity(0.22), location: 0.4),
                .init(color: .white.opacity(0.32), location: 0.5),
                .init(color: .white.opacity(0.22), location: 0.6),
                .init(color: .white.opacity(0), location: 1),
            ], startPoint: .leading, endPoint: .trailing))
            .frame(width: beamW, height: H * 1.2)
            .transformEffect(CGAffineTransform(a: 1, b: 0, c: tan(-15 * .pi / 180), d: 1, tx: 0, ty: 0))
            .offset(x: txFrac * beamW)
            .frame(width: W, height: H, alignment: .leading)
            .opacity(Double(opacity))
            .clipped()
    }

    private var sparkColor: Color { isS ? Color(hex: "#D2B4FF") : Color(hex: "#FFF08C") }
    private var sparkGlow: Color { isS ? Color(hex: "#AA78FF") : Color(hex: "#FFE650") }
}

func tierBorderColor(base: Double) -> Color {
    switch base {
    case 55...: return Color(hex: "#8a5cf6")
    case 46..<55: return G.gold
    case 38..<46: return G.green
    case 31..<38: return G.blue
    default: return G.border
    }
}

struct PlayerCardView: View {
    let player: PlayerVM

    private var tierLabel: String {
        switch player.base { case 55...: return "S"; case 46..<55: return "A"; case 38..<46: return "B"; case 31..<38: return "C"; case 24..<31: return "D"; case 16..<24: return "E"; default: return "F" }
    }
    private var seasonsText: String {
        if player.team.isEmpty && player.toYear == nil { return "\(player.fromYear)–present" }
        let seasons = max(1, Int(ceil(player.GP / 82)))
        return "\(seasons) \(seasons == 1 ? "season" : "seasons")"
    }

    var body: some View {
        VStack(spacing: 12) {
            // Header: headshot + name/pos + tags
            HStack(alignment: .top, spacing: 12) {
                PlayerHeadshotView(personId: player.personId, initial: player.position.prefix(1).uppercased(), size: 80)
                VStack(alignment: .leading, spacing: 3) {
                    Text(player.fullName).font(.system(size: 16, weight: .bold)).foregroundStyle(G.white).lineLimit(1)
                    Text("\(player.position.uppercased()) · \(eraDisplayLabel(player.era)) · \(player.team)")
                        .font(.system(size: 10, weight: .medium)).tracking(0.5).foregroundStyle(G.grey).lineLimit(1)
                }
                Spacer(minLength: 0)
                Text(tierLabel).font(Fonts.bebas(24)).foregroundStyle(tierBorderColor(base: player.base).opacity(0.9))
            }

            // Trait tags
            if !cardTags.isEmpty {
                FlowTags(tags: cardTags)
            }

            // Big three (gold)
            HStack(spacing: 1) {
                bigStat("PTS", player.PTS); bigStat("REB", player.REB); bigStat("AST", player.AST)
            }.background(G.border)

            // Secondary stats
            HStack(spacing: 1) {
                smallStat("TS%", pctS(player.TS_PCT)); smallStat("FG%", pctS(player.FG_PCT))
                smallStat("3P%", pctS(player.FG3_PCT)); smallStat("STL", player.STL.map { String(format: "%.1f", $0) } ?? "—")
            }.background(G.border)
            HStack(spacing: 1) {
                smallStat("BLK", player.BLK.map { String(format: "%.1f", $0) } ?? "—"); smallStat("TOV", player.TOV.map { String(format: "%.1f", $0) } ?? "—")
                smallStat("HT", player.height.isEmpty ? "—" : player.height); smallStat("WT", player.weight.isEmpty ? "—" : player.weight)
            }.background(G.border)

            Text(seasonsText).font(.system(size: 10)).foregroundStyle(G.greyDark)
        }
        .padding(16)
        .background(tierBackground(base: player.base))
        .overlay(TierShine(base: player.base))
        .overlay(Rectangle().stroke(tierBorderColor(base: player.base).opacity(player.base >= 46 ? 0.7 : 1), lineWidth: 1))
        .clipped()
    }

    private var cardTags: [(String, Color)] {
        var t: [(String, Color)] = []
        if player.greatest75 { t.append(("75 GREATEST", G.gold)) }
        if player.rings > 0 { t.append(("\(player.rings)× CHAMP", G.gold)) }
        if player.defAnchor { t.append(("DEF ANCHOR T\(player.anchorTier)", G.blue)) }
        if player.offAnchor { t.append(("OFF ANCHOR T\(player.anchorTier)", G.gold)) }
        if player.floorGeneral { t.append(("FLOOR GENERAL", Color(hex: "#E0D4FF"))) }
        if player.shootingStar { t.append(("SHOOTING STAR T\(player.shootingStarTier)", G.pink)) }
        if player.glassClean { t.append(("GLASS CLEANER", G.green)) }
        if player.timeless { t.append(("TIMELESS", Color(hex: "#C084FC"))) }
        if player.duoPartners != nil { t.append(("DYNAMIC DUO", G.teal)) }
        if player.flexPositions != nil { t.append(("FLEX", G.blue)) }
        if player.sixthMan { t.append(("6TH MAN", Color(hex: "#FF8C42"))) }
        return t
    }

    private func bigStat(_ label: String, _ v: Double) -> some View {
        VStack(spacing: 2) {
            Text(String(format: "%.1f", v)).font(Fonts.bebas(24)).foregroundStyle(G.gold)
            Text(label).font(.system(size: 9)).foregroundStyle(G.greyDark)
        }.frame(maxWidth: .infinity).padding(.vertical, 10).background(Color.black.opacity(0.55))
    }
    private func smallStat(_ label: String, _ v: String) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.system(size: 11, weight: .medium)).foregroundStyle(G.white)
            Text(label).font(.system(size: 9)).foregroundStyle(G.greyDark)
        }.frame(maxWidth: .infinity).padding(.vertical, 7).background(Color.black.opacity(0.45))
    }
    private func pctS(_ v: Double?) -> String { v.map { String(format: "%.1f%%", $0 * 100) } ?? "—" }
}

/// Simple wrapping tag row.
struct FlowTags: View {
    let tags: [(String, Color)]
    var body: some View {
        FlexibleWrap(tags.indices.map { $0 }, spacing: 4) { i in
            Text(tags[i].0).font(.system(size: 9, weight: .bold)).tracking(0.6).foregroundStyle(tags[i].1)
                .padding(.horizontal, 6).padding(.vertical, 2.5)
                .overlay(Rectangle().stroke(tags[i].1.opacity(0.35), lineWidth: 1))
        }
    }
}

/// Minimal flow layout for wrapping chips.
struct FlexibleWrap<Data: RandomAccessCollection, Content: View>: View where Data.Element: Hashable {
    let data: Data
    let spacing: CGFloat
    let content: (Data.Element) -> Content
    init(_ data: Data, spacing: CGFloat = 4, @ViewBuilder content: @escaping (Data.Element) -> Content) {
        self.data = data; self.spacing = spacing; self.content = content
    }
    var body: some View {
        Layout(spacing: spacing) { ForEach(Array(data), id: \.self) { content($0) } }
    }
    struct Layout: SwiftUI.Layout {
        var spacing: CGFloat
        func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
            let maxW = proposal.width ?? .infinity
            var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0
            for s in subviews {
                let sz = s.sizeThatFits(.unspecified)
                if x + sz.width > maxW { x = 0; y += rowH + spacing; rowH = 0 }
                x += sz.width + spacing; rowH = max(rowH, sz.height)
            }
            return CGSize(width: maxW, height: y + rowH)
        }
        func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
            var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
            for s in subviews {
                let sz = s.sizeThatFits(.unspecified)
                if x + sz.width > bounds.maxX { x = bounds.minX; y += rowH + spacing; rowH = 0 }
                s.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
                x += sz.width + spacing; rowH = max(rowH, sz.height)
            }
        }
    }
}
