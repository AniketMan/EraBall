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
    @State private var showPatchNotes = false
    @State private var showSupporters = false
    @State private var showVolume = false
    @Namespace private var topBarGlass
    @Namespace private var eraGridGlass

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
        .sheet(isPresented: $showPatchNotes) { PatchNotesSheet() }
        .sheet(isPresented: $showSupporters) { SupportersSheet() }
    }

    // MARK: - Top bar controls (web parity: ?, era-theme toggle, volume popover)

    private var topBarControls: some View {
        GlassEffectContainer(spacing: 8) {
            HStack(spacing: 8) {
                // "?" — how to play
                Button { showHelp = true } label: {
                    Image(systemName: "questionmark")
                        .font(.system(size: 13, weight: .bold)).foregroundStyle(G.grey)
                        .frame(width: 34, height: 34).contentShape(.rect)
                }
                .buttonStyle(.plain)
                .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 8))
                .glassEffectID("help", in: topBarGlass)

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
                    .padding(.horizontal, 8).frame(height: 34).contentShape(.rect)
                }
                .buttonStyle(.plain)
                .glassEffect(.regular.interactive().tint(session.themeOn ? G.gold.opacity(0.14) : .clear), in: .rect(cornerRadius: 8))
                .glassEffectID("theme", in: topBarGlass)

                // Volume — speaker opens a popover with a slider + MUTE
                Button { showVolume = true } label: {
                    Image(systemName: audio.isSilent ? "speaker.slash.fill" : "speaker.wave.2.fill")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(audio.isSilent ? G.grey : G.gold)
                        .frame(width: 34, height: 34).contentShape(.rect)
                }
                .buttonStyle(.plain)
                .glassEffect(.regular.interactive().tint(audio.isSilent ? .clear : G.gold.opacity(0.14)), in: .rect(cornerRadius: 8))
                .glassEffectID("volume", in: topBarGlass)
                .popover(isPresented: $showVolume, arrowEdge: .top) { volumePopover }
            }
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
                    VStack(spacing: 12) {
                        Text(ERA_YEARS[era] ?? "").font(.system(size: 11, weight: .semibold)).tracking(4).foregroundStyle(G.goldDim)
                        Text(ERA_DESC[era]?.style ?? "").font(.system(size: 13, weight: .medium)).foregroundStyle(G.white)
                            .multilineTextAlignment(.center).lineSpacing(4).frame(maxWidth: 320)
                        Text((ERA_DESC[era]?.note ?? "").uppercased()).font(.system(size: 10, weight: .semibold)).tracking(2)
                            .foregroundStyle(G.gold).multilineTextAlignment(.center)
                            .padding(.horizontal, 12).padding(.vertical, 6)
                            .glassEffect(.regular.tint(G.gold.opacity(0.12)), in: .capsule)
                        Text("Players perform best in their home era — drafting across decades applies a rating penalty")
                            .font(.system(size: 11)).foregroundStyle(G.grey).multilineTextAlignment(.center).frame(maxWidth: 340)
                    }
                    .padding(16)
                    .glassEffect(.regular, in: .rect(cornerRadius: 16))
                    .padding(.top, 14).transition(.opacity)
                }
            }
        } else {
            Text("SELECT AN ERA").font(Fonts.bebas(24)).tracking(6).foregroundStyle(G.greyDark).padding(.vertical, 24)
        }
    }

    private var eraGrid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
            ForEach(ALL_ERAS, id: \.self) { e in
                let selected = session.selectedEra == e
                Button { session.selectEra(e) } label: {
                    Text(eraDisplayLabel(e).uppercased()).font(Fonts.bebas(22)).tracking(1.5)
                        .foregroundStyle(selected ? G.black : G.grey)
                        .minimumScaleFactor(0.6).lineLimit(1)
                        .frame(maxWidth: .infinity).frame(height: 58).contentShape(.rect)
                }
                .buttonStyle(.plain).disabled(session.eraSpinning).opacity(session.eraSpinning ? 0.4 : 1)
                // Each cell owns its own glass — no cross-cell glassEffectID, so the gold
                // stays on the one selected cell instead of sweeping across the whole grid.
                .glassEffect(selected ? .regular.tint(G.gold) : .clear, in: .rect(cornerRadius: 10))
                .scaleEffect(selected ? 1.04 : 1)
                .animation(.spring(response: 0.34, dampingFraction: 0.72), value: selected)
            }
        }
        .frame(maxWidth: 400)
    }

    private var actions: some View {
        VStack(spacing: 12) {
            if session.selectedEra != nil && !session.eraSpinning {
                // Primary draft modes — side by side to cut vertical scrolling.
                HStack(spacing: 10) {
                    Button("NORMAL") { session.beginDraft(salaryCap: false) }
                        .buttonStyle(GoldButtonStyle(fullWidth: true))
                    Button("SALARY CAP") { session.beginDraft(salaryCap: true) }
                        .buttonStyle(PurpleButtonStyle(fullWidth: true))
                }
                .frame(maxWidth: 320)
                // Secondary row: re-roll era + sandbox.
                HStack(spacing: 10) {
                    Button(session.eraSpinning ? "SPINNING..." : "RANDOM") { session.spinEra() }
                        .buttonStyle(GhostButtonStyle()).disabled(session.eraSpinning)
                    Button("SANDBOX") { session.beginDraft(salaryCap: false, sandbox: true) }
                        .buttonStyle(GhostButtonStyle())
                }
                .frame(maxWidth: 320)
            } else {
                Button(session.eraSpinning ? "SPINNING..." : "RANDOM ERA") { session.spinEra() }
                    .buttonStyle(GoldButtonStyle(fullWidth: true)).frame(maxWidth: 320).disabled(session.eraSpinning)
            }

            HStack(spacing: 20) {
                Button("HOW TO PLAY") { showHelp = true }.buttonStyle(.plain)
                    .font(.system(size: 11, weight: .semibold)).tracking(2).foregroundStyle(G.greyDark)
                Button("WHAT'S NEW!") { showPatchNotes = true }.buttonStyle(.plain)
                    .font(.system(size: 11, weight: .semibold)).tracking(1).foregroundStyle(G.gold)
            }
            .padding(.top, 2)

            footerLinks
            Text("v2.0").font(.system(size: 10)).tracking(2).foregroundStyle(G.greyDark.opacity(0.6)).padding(.top, 4)
        }
        .animation(.smooth(duration: 0.25), value: session.selectedEra)
    }

    // MARK: - Footer links (web: bottom-right footer — support / socials / portfolio)

    private var footerLinks: some View {
        VStack(spacing: 10) {
            FooterLinkButton(url: "https://ko-fi.com/eshanb", label: "SUPPORT THE GAME", tint: G.gold)
            Button { showSupporters = true } label: {
                Text("★ SUPPORTER HALL OF FAME").font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(G.gold)
                    .frame(width: 300, height: 40).overlay(Rectangle().stroke(G.gold, lineWidth: 1))
            }.buttonStyle(.plain)

            Text("SUGGESTIONS OR BUGS?").font(.system(size: 9, weight: .semibold)).tracking(1.5)
                .foregroundStyle(G.greyDark).padding(.top, 8)
            HStack(spacing: 12) {
                FooterLinkButton(url: "https://discord.gg/gFAp5adX", label: "DISCORD", tint: G.greyDark, width: 144)
                FooterLinkButton(url: "https://x.com/Eshan_Design", label: "TWITTER", tint: G.greyDark, width: 144)
            }
            FooterLinkButton(url: "https://eshanbhattdesign.com", label: "ESHANBHATTDESIGN.COM", tint: G.greyDark)
        }
        .padding(.top, 6)
    }
}

// MARK: - Footer link (opens an external URL in Safari)

struct FooterLinkButton: View {
    let url: String
    let label: String
    var tint: Color
    var width: CGFloat = 300
    var body: some View {
        Link(destination: URL(string: url)!) {
            Text(label).font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(tint)
                .frame(maxWidth: width == .infinity ? .infinity : nil)
                .frame(width: width == .infinity ? nil : width, height: 40)
                .overlay(Rectangle().stroke(tint == G.gold ? G.goldDim : G.border, lineWidth: 1))
        }.buttonStyle(.plain)
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
