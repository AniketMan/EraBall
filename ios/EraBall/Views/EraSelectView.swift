// EraSelectView.swift — port of app/features/era-selection/EraSelection.tsx
import SwiftUI

private let ERA_YEARS: [String: String] = [
    "50s": "1950–1959", "60s": "1960–1969", "70s": "1970–1979", "80s": "1980–1989",
    "90s": "1990–1999", "00s": "2000–2009", "10s": "2010–2019", "20s": "2020–present",
]
private let ERA_DESC: [String: (style: String, note: String)] = [
    "50s": ("Slow, physical, half-court basketball. No 3-point line, and very low scoring. Big men ruled the paint.", "Pre-3pt - Modern shooters lose value here"),
    "60s": ("Dominant big men, intense defense. Bill Russell era. Athleticism beginning to shape the game.", "Pre-3pt - Modern shooters lose value here"),
    "70s": ("ABA Merger. Brutal physical defense. Kareem's sky hook.", "Pre-3pt - Modern shooters lose value here"),
    "80s": ("3-point line introduced in the league. Magic vs Bird.", "3pt era begins - Pre-3pt bigs take a cut"),
    "90s": ("All time Defenses, Lower scoring. Hand-checking allowed. The Jordan era.", "Defense Era - Most eras cross over cleanly"),
    "00s": ("Post-Jordan transition. the Shaq and Kobe Era. Rising international talent. Introduction of the 4 round, best of 7 Playoffs.", "Bridge era - Minimal penalties most directions"),
    "10s": ("3-point volume surges. Steph vs Lebron. Rise of Positionless basketball.", "Near-modern - Very low era penalties"),
    "20s": ("Peak spacing, pace, and 3-point volume. Versatility is everything. Old-school bigs and pre-3pt era (50s/60s/70s) players struggle most here.", "Current era - 2020s players at full strength"),
]

struct EraSelectView: View {
    @Environment(GameSession.self) private var session
    @Environment(AudioManager.self) private var audio
    @State private var showHelp = false
    @State private var showLeaderboard = false
    @State private var showLifetime = false
    @State private var showAchievements = false
    @State private var showPatchNotes = false
    @State private var showSupporters = false
    @State private var showVolume = false

    var body: some View {
        ZStack {
            G.black.ignoresSafeArea()
            Starfield()
            VStack(spacing: 0) {
                TopBar(onTitleTap: nil) {
                    topBarControls
                }
                ScrollView {
                    VStack(spacing: 40) {
                        bannerBlock
                        eraGrid
                        actions
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.horizontal, 16).padding(.top, 24).padding(.bottom, 40)
                }
            }
        }
        .sheet(isPresented: $showHelp) { HowToPlaySheet() }
        .sheet(isPresented: $showLeaderboard) { LeaderboardSheet() }
        .sheet(isPresented: $showLifetime) { LifetimeStatsView() }
        .sheet(isPresented: $showAchievements) { AchievementsView() }
        .sheet(isPresented: $showPatchNotes) { PatchNotesSheet() }
        .sheet(isPresented: $showSupporters) { SupportersSheet() }
    }

    // MARK: - Top bar controls (web parity: ?, era-theme toggle, volume popover)

    private var topBarControls: some View {
        HStack(spacing: 8) {
        // "?" — how to play
        Button { showHelp = true } label: {
            Image(systemName: "questionmark")
                .font(.system(size: 13, weight: .bold)).foregroundStyle(G.grey)
                .frame(width: 34, height: 34).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                .contentShape(.rect)
        }.buttonStyle(.plain)

        // Era theme toggle
        Button { session.themeOn.toggle() } label: {
            HStack(spacing: 6) {
                Text("ERA THEME").font(.system(size: 9, weight: .semibold)).tracking(1.5)
                Text(session.themeOn ? "ON" : "OFF").font(.system(size: 9, weight: .bold)).tracking(1)
                    .foregroundStyle(session.themeOn ? G.black : G.grey)
                    .padding(.horizontal, 5).padding(.vertical, 2)
                    .background(session.themeOn ? G.gold : G.surface)
            }
            .foregroundStyle(G.grey)
            .padding(.horizontal, 8).frame(height: 34)
            .overlay(Rectangle().stroke(session.themeOn ? G.gold.opacity(0.6) : G.border, lineWidth: 1))
            .contentShape(.rect)
        }.buttonStyle(.plain)

        // Volume — speaker opens a popover with a slider + MUTE
        Button { showVolume = true } label: {
            Image(systemName: audio.isSilent ? "speaker.slash.fill" : "speaker.wave.2.fill")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(audio.isSilent ? G.grey : G.gold)
                .frame(width: 34, height: 34)
                .overlay(Rectangle().stroke(audio.isSilent ? G.border : G.gold.opacity(0.6), lineWidth: 1))
                .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .popover(isPresented: $showVolume, arrowEdge: .top) { volumePopover }
        }
    }

    private var volumePopover: some View {
        VStack(spacing: 14) {
            Text("VOLUME").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
            HStack(spacing: 10) {
                Image(systemName: "speaker.fill").font(.system(size: 11)).foregroundStyle(G.greyDark)
                Slider(value: Binding(get: { audio.volume }, set: { audio.volume = $0 }), in: 0...1)
                    .tint(G.gold).frame(width: 160)
                Image(systemName: "speaker.wave.3.fill").font(.system(size: 11)).foregroundStyle(G.greyDark)
            }
            Button { audio.toggleMute() } label: {
                Text(audio.isMuted ? "UNMUTE" : "MUTE")
                    .font(.system(size: 11, weight: .semibold)).tracking(2)
                    .foregroundStyle(audio.isMuted ? G.black : G.grey)
                    .frame(maxWidth: .infinity).frame(height: 34)
                    .background(audio.isMuted ? G.gold : G.surface)
                    .overlay(Rectangle().stroke(audio.isMuted ? G.gold : G.border, lineWidth: 1))
            }.buttonStyle(.plain)
        }
        .padding(18).frame(width: 240)
        .background(G.black)
        .presentationCompactAdaptation(.popover)
    }

    @ViewBuilder private var bannerBlock: some View {
        if let shown = session.displayEra {
            VStack(spacing: 0) {
                Text("SIMULATION ERA").font(.system(size: 11, weight: .semibold)).tracking(5)
                    .foregroundStyle(G.grey).padding(.bottom, 8)
                EraBannerView(era: shown, dimmed: session.eraSpinning)
                if !session.eraSpinning, let era = session.selectedEra {
                    VStack(spacing: 14) {
                        Text(ERA_YEARS[era] ?? "").font(.system(size: 11, weight: .semibold)).tracking(4).foregroundStyle(G.goldDim)
                        Text(ERA_DESC[era]?.style ?? "").font(.system(size: 13)).foregroundStyle(G.grey)
                            .multilineTextAlignment(.center).lineSpacing(4).frame(maxWidth: 320)
                        Text((ERA_DESC[era]?.note ?? "").uppercased()).font(.system(size: 10, weight: .semibold)).tracking(2)
                            .foregroundStyle(G.goldDim).multilineTextAlignment(.center)
                            .padding(.horizontal, 12).padding(.vertical, 6).overlay(Rectangle().stroke(G.goldDim, lineWidth: 1))
                        Text("Players perform best in their home era - drafting across decades applies a rating penalty")
                            .font(.system(size: 11)).foregroundStyle(G.greyDark.opacity(0.7)).multilineTextAlignment(.center).frame(maxWidth: 340)
                    }.padding(.top, 14).transition(.opacity)
                }
            }
        } else {
            Text("SELECT AN ERA").font(Fonts.bebas(24)).tracking(6).foregroundStyle(G.greyDark).padding(.vertical, 24)
        }
    }

    private var eraGrid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
            ForEach(ALL_ERAS, id: \.self) { e in
                Button { session.selectEra(e) } label: {
                    Text(eraDisplayLabel(e).uppercased()).font(Fonts.bebas(22)).tracking(1.5)
                        .foregroundStyle(session.selectedEra == e ? G.black : G.grey)
                        .minimumScaleFactor(0.6).lineLimit(1)
                        .frame(maxWidth: .infinity).frame(height: 58)
                        .background(session.selectedEra == e ? G.gold : G.surface)
                        .overlay(Rectangle().stroke(session.selectedEra == e ? G.gold : G.border, lineWidth: 1))
                }
                .buttonStyle(.plain).disabled(session.eraSpinning).opacity(session.eraSpinning ? 0.4 : 1)
            }
        }
        .frame(maxWidth: 400)
        .animation(.easeOut(duration: 0.15), value: session.selectedEra)
    }

    private var actions: some View {
        VStack(spacing: 12) {
            Button(session.eraSpinning ? "SPINNING..." : "RANDOM") { session.spinEra() }
                .buttonStyle(GhostButtonStyle()).frame(width: 200).disabled(session.eraSpinning)
            if session.selectedEra != nil && !session.eraSpinning {
                Button("NORMAL DRAFT") { session.beginDraft(salaryCap: false) }
                    .buttonStyle(GoldButtonStyle(fullWidth: true)).frame(width: 200)
                Button("SALARY CAP DRAFT") { session.beginDraft(salaryCap: true) }
                    .buttonStyle(PurpleButtonStyle(fullWidth: true)).frame(width: 200)
            }
            Button("HOW TO PLAY") { showHelp = true }.buttonStyle(.plain)
                .font(.system(size: 11, weight: .semibold)).tracking(3).foregroundStyle(G.greyDark).padding(.top, 2)
            if session.selectedEra != nil && !session.eraSpinning {
                Text("OR PLAY").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.greyDark)
                Button("SANDBOX") { session.beginDraft(salaryCap: false, sandbox: true) }
                    .buttonStyle(GhostButtonStyle()).frame(width: 200)
            }
            Button("LEADERBOARD") { showLeaderboard = true }.buttonStyle(GhostButtonStyle()).frame(width: 200)
            Button("LIFETIME STATS") { showLifetime = true }.buttonStyle(GhostButtonStyle()).frame(width: 200)
            Button("ACHIEVEMENTS") { showAchievements = true }.buttonStyle(GhostButtonStyle()).frame(width: 200)
            Button("WHAT'S NEW!") { showPatchNotes = true }.buttonStyle(.plain)
                .font(.system(size: 11, weight: .semibold)).tracking(1).foregroundStyle(G.gold).padding(.top, 2)
            Button("★ SUPPORTER HALL OF FAME") { showSupporters = true }.buttonStyle(.plain)
                .font(.system(size: 10, weight: .semibold)).tracking(1).foregroundStyle(G.goldDim)
            Text("v2.0").font(.system(size: 10)).tracking(2).foregroundStyle(G.greyDark.opacity(0.6))
        }
        .animation(.smooth(duration: 0.25), value: session.selectedEra)
    }
}

// MARK: - Era banner (R2 art + edge fades + big label)

struct EraBannerView: View {
    let era: String
    var dimmed = false
    var body: some View {
        ZStack {
            BleedImage(url: URL(string: "https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev/\(era).webp"), height: 170)
                .overlay(LinearGradient(stops: [.init(color: G.black, location: 0), .init(color: .clear, location: 0.18), .init(color: .clear, location: 0.82), .init(color: G.black, location: 1)], startPoint: .leading, endPoint: .trailing))
                .overlay(LinearGradient(stops: [.init(color: G.black.opacity(0.9), location: 0), .init(color: .clear, location: 0.25), .init(color: .clear, location: 0.75), .init(color: G.black.opacity(0.9), location: 1)], startPoint: .top, endPoint: .bottom))
            Text(eraDisplayLabel(era).uppercased()).font(Fonts.bebas(92))
                .foregroundStyle(dimmed ? G.greyDark : G.white)
                .shadow(color: .black.opacity(0.9), radius: 4, y: 2).shadow(color: .black.opacity(0.8), radius: 24)
                .contentTransition(.numericText()).animation(.snappy(duration: 0.15), value: era)
        }
        .frame(height: 170)
    }
}
