// Modals.swift — HowToPlay + PatchNotes + Supporters (ports of app/_shared/*Modal)
import SwiftUI

/// Project supporters (Ko-fi). Single source of truth — kept in sync with the web
/// app/_shared/SupportersModal.tsx SUPPORTERS array.
let SUPPORTERS: [String] = [
    "Klass", "Klass's Friend", "TheZDSpecial", "RM", "David",
    "KV2324", "Oretliun", "EliDunlay", "WhereIsJarrett", "zayyys editzz",
    "Brennan Gorby", "Zane Luna", "BFXT", "Yung Girt",
]

struct SupportersSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    Text("These supporters are keeping EraBall alive!")
                        .font(.system(size: 11)).foregroundStyle(G.grey).padding(.bottom, 4)
                    GlassEffectContainer(spacing: 8) {
                        VStack(spacing: 8) {
                            ForEach(SUPPORTERS, id: \.self) { name in
                                HStack(spacing: 10) {
                                    Text("★").font(.system(size: 14)).foregroundStyle(G.gold)
                                    Text(name).font(.system(size: 13, weight: .medium)).tracking(0.4).foregroundStyle(G.white)
                                    Spacer()
                                }
                                .padding(.horizontal, 12).padding(.vertical, 10)
                                .overlay(SupporterSheen().clipShape(RoundedRectangle(cornerRadius: 10)))
                                .glassEffect(.regular.tint(G.gold.opacity(0.06)), in: .rect(cornerRadius: 10))
                            }
                        }
                    }
                    Button {
                        openURL(URL(string: "https://ko-fi.com/eshanb")!)
                    } label: {
                        HStack(spacing: 4) {
                            Text("Support on Ko-fi").foregroundStyle(G.goldDim)
                            Text("· donate to be here").foregroundStyle(G.greyDark)
                        }
                        .font(.system(size: 11)).tracking(0.5)
                        .frame(maxWidth: .infinity).padding(.vertical, 11)
                        .glassEffect(.regular.interactive(), in: .capsule)
                    }
                    .buttonStyle(.plain).padding(.top, 8)
                }.padding(24)
            }
            .background(G.black).navigationTitle("THANK YOU!").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }.preferredColorScheme(.dark)
    }
}

/// Gold sheen beam sweeping across a supporter card (port of globals.css .card-sheen-beam).
struct SupporterSheen: View {
    var body: some View {
        GeometryReader { geo in
            TimelineView(.animation) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                let period = 4.5
                let p = t.truncatingRemainder(dividingBy: period) / period
                let W = geo.size.width, H = geo.size.height
                let beamW = W * 0.35
                let txFrac: CGFloat = p < 0.4 ? -1.5 + 5.0 * CGFloat(p / 0.4) : 3.5
                let opacity: CGFloat = p < 0.08 ? CGFloat(p / 0.08)
                    : p < 0.4 ? 1 - CGFloat((p - 0.08) / 0.32) : 0
                Rectangle()
                    .fill(LinearGradient(stops: [
                        .init(color: .white.opacity(0), location: 0),
                        .init(color: G.gold.opacity(0.28), location: 0.5),
                        .init(color: .white.opacity(0), location: 1),
                    ], startPoint: .leading, endPoint: .trailing))
                    .frame(width: beamW, height: H * 1.5)
                    .transformEffect(CGAffineTransform(a: 1, b: 0, c: tan(-15 * .pi / 180), d: 1, tx: 0, ty: 0))
                    .offset(x: txFrac * beamW)
                    .frame(width: W, height: H, alignment: .leading)
                    .opacity(Double(opacity))
                    .clipped()
            }
        }
        .allowsHitTesting(false)
    }
}

struct HowToPlaySheet: View {
    @Environment(\.dismiss) private var dismiss
    private let steps: [(String, String, String)] = [
        ("1", "PICK YOUR SIMULATION ERA", "Choose a decade: 50s through the 2020s. This is the era of basketball your season will be simulated in, following that era's rules and trends."),
        ("2", "SPIN TO DRAFT", "Each spin lands on a franchise and an era of that franchise. Choose one player from everyone who played for that team during that era to fill an open slot. You get only ONE respin for the entire draft."),
        ("3", "FILL 9 SPOTS", "5 starters (PG - SG - SF - PF - C) and 4 bench players. Starters play 35 minutes per game and carry more weight in the simulation. Bench players contribute at a reduced rate."),
        ("4", "POSITIONAL FIT", "Playing a player at their natural position = no penalty. One position off = −10% rating. Way out of position = −25%. FLEX players like LeBron, Jokić, and Giannis can fill multiple slots penalty-free."),
        ("5", "DRAFT A COACH", "One spin reveals three coaches — pick the best fit. Grades come from real NBA records; gurus and franchise pairs upgrade them. A great coach elevates your roster, a bad one holds it back."),
        ("6", "SIMULATE", "A full season is simulated with era-adjusted stats. Win at least half your games to make the playoffs and chase a championship. Your run earns a score for the leaderboard."),
    ]
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    ForEach(steps, id: \.0) { s in
                        HStack(alignment: .top, spacing: 14) {
                            Text(s.0).font(Fonts.bebas(24)).foregroundStyle(G.gold)
                            VStack(alignment: .leading, spacing: 6) {
                                Text(s.1).font(.system(size: 12, weight: .semibold)).tracking(2).foregroundStyle(G.white)
                                Text(s.2).font(.system(size: 14)).lineSpacing(4).foregroundStyle(G.grey)
                            }
                        }
                    }
                }.padding(24)
            }
            .background(G.black).navigationTitle("HOW TO PLAY").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }.preferredColorScheme(.dark)
    }
}

struct PatchNotesSheet: View {
    @Environment(\.dismiss) private var dismiss
    private let notes: [(String, [String])] = [
        ("v2.0 — Native iOS", ["Full native SwiftUI rebuild with Liquid Glass.", "Runs the exact web simulation engine (verified byte-for-byte).", "Game Center leaderboards, friends, and achievements."]),
        ("v1.5.8", ["Coach draft now reveals three coaches — pick one.", "Franchise Pair coach grade upgrades.", "Floor General tag."]),
        ("v1.5.6", ["S-tier coaches.", "New duos and rings data.", "Timeless tier tuning."]),
    ]
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    ForEach(notes, id: \.0) { n in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(n.0).font(Fonts.bebas(22)).tracking(1).foregroundStyle(G.gold)
                            ForEach(n.1, id: \.self) { line in
                                HStack(alignment: .top, spacing: 8) {
                                    Text("·").foregroundStyle(G.goldDim)
                                    Text(line).font(.system(size: 13)).foregroundStyle(G.grey)
                                }
                            }
                        }
                    }
                }.padding(24)
            }
            .background(G.black).navigationTitle("WHAT'S NEW").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }.preferredColorScheme(.dark)
    }
}
