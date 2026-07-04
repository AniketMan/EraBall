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
                VStack(alignment: .leading, spacing: 10) {
                    Text("These supporters are keeping EraBall alive!")
                        .font(.system(size: 11)).foregroundStyle(G.grey).padding(.bottom, 4)
                    ForEach(SUPPORTERS, id: \.self) { name in
                        HStack(spacing: 10) {
                            Text("★").font(.system(size: 12)).foregroundStyle(G.gold)
                            Text(name).font(.system(size: 14, weight: .medium)).foregroundStyle(G.white)
                            Spacer()
                        }
                        .padding(.horizontal, 12).padding(.vertical, 10)
                        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                    }
                    Button {
                        openURL(URL(string: "https://ko-fi.com/eshanb")!)
                    } label: {
                        Text("Support on Ko-fi · donate to be here")
                            .font(.system(size: 11)).tracking(0.5).foregroundStyle(G.goldDim)
                            .frame(maxWidth: .infinity).padding(.vertical, 10)
                            .overlay(Rectangle().stroke(G.border, lineWidth: 1))
                    }
                    .buttonStyle(.plain).padding(.top, 6)
                }.padding(24)
            }
            .background(G.black).navigationTitle("THANK YOU!").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }.preferredColorScheme(.dark)
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
