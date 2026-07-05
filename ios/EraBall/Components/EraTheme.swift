// EraTheme.swift — port of the web app's era "theme" (app/page.tsx greyscale mode).
// Two parts, matching the web exactly:
//   1. A color grade applied to the whole content tree (`eraFilter`).
//   2. A stack of fixed, full-screen, non-interactive overlays rendered ABOVE the
//      content (the web renders these via createPortal, so they are NOT color-graded):
//      CRT scanlines + flicker, vignette, a sweeping scan bar (50s/60s), animated
//      film grain, and warm decade tints (60s/00s/10s).
import SwiftUI
import CoreImage
import CoreImage.CIFilterBuiltins

private let CRT_ERAS: Set<String> = ["50s", "60s", "70s", "80s", "90s"]

/// Per-era grain strength. Highest at the 50s and ramping down through the decades as
/// footage/broadcast gets cleaner (Yedlin: amplitude also stays luminance-dependent via
/// the `.overlay` blend). Nil = no grain (20s = pristine).
private func grainAmount(_ era: String) -> Double? {
    switch era {
    case "50s": return 0.55
    case "60s": return 0.42
    case "70s": return 0.32
    case "80s": return 0.22
    case "90s": return 0.15
    case "00s": return 0.11
    case "10s": return 0.07
    default:    return nil
    }
}

// MARK: - Public modifier

extension View {
    /// Apply the full era theme (color grade + overlays) when the toggle is on.
    func eraThemed(era: String?, on: Bool) -> some View {
        modifier(EraThemeModifier(era: era, on: on))
    }
}

private struct EraThemeModifier: ViewModifier {
    let era: String?
    let on: Bool

    func body(content: Content) -> some View {
        content
            .modifier(EraColorGrade(era: (on ? era : nil)))
            // Grain rides in the overlay stack (a non-interactive sibling), NOT as a
            // layerEffect wrapping the content — a layerEffect rasterizes the tree and
            // kills the Liquid Glass interactive button animations. As a blended overlay
            // it stays luminance-dependent (via `.overlay` blend) AND preserves all
            // press/press-glow/spring animations underneath.
            .overlay { EraThemeOverlay(era: (on ? era : nil)).ignoresSafeArea() }
    }
}

// MARK: - Color grade (web `eraFilter`)

private struct EraColorGrade: ViewModifier {
    let era: String?

    // A STABLE modifier chain (always the same four filters, only the VALUES change per
    // era) so switching eras doesn't re-wrap the content and destroy its view identity —
    // that identity churn is what made the era description "pop" instead of animate.
    // Values are the web `eraFilter`; no-op defaults (1/1/1/0) elsewhere.
    private var grayscale: Double { era == "50s" ? 1 : 0 }
    private var saturation: Double {
        switch era { case "60s": return 0.82; case "70s": return 0.88; case "10s": return 1.15; default: return 1 }
    }
    private var contrast: Double {
        switch era { case "70s": return 0.94; case "10s": return 1.06; default: return 1 }
    }
    private var brightness: Double {
        switch era { case "70s": return -0.03; case "10s": return 0.02; default: return 0 }
    }

    func body(content: Content) -> some View {
        content
            .saturation(saturation)
            .contrast(contrast)
            .brightness(brightness)
            .grayscale(grayscale)
            .animation(.easeInOut(duration: 0.35), value: era)
    }
}

// MARK: - Overlay stack

private struct EraThemeOverlay: View {
    let era: String?
    var body: some View {
        if let era {
            ZStack {
                if CRT_ERAS.contains(era) {
                    Scanlines()
                    Vignette()
                    if era == "50s" || era == "60s" { ScanBar() }
                }
                if era == "60s" {
                    Color(red: 1.0, green: 220/255, blue: 80/255).opacity(0.05)
                }
                if era == "00s" {
                    Color(red: 1.0, green: 175/255, blue: 70/255).opacity(0.06)
                    Vignette()
                }
                if era == "10s" {
                    Color(red: 1.0, green: 200/255, blue: 90/255).opacity(0.03)
                }
                // Grain last so it sits over the other overlays; ramped by era.
                if let amount = grainAmount(era) { GrainOverlay(opacity: amount) }
            }
            .allowsHitTesting(false)
        }
    }
}

// CRT scanlines: 2px translucent-white / 2px translucent-black stripes, with a subtle flicker.
private struct Scanlines: View {
    @State private var flicker = 1.0
    var body: some View {
        Canvas { ctx, size in
            var y = 0.0
            while y < size.height {
                ctx.fill(Path(CGRect(x: 0, y: y, width: size.width, height: 2)), with: .color(.white.opacity(0.03)))
                ctx.fill(Path(CGRect(x: 0, y: y + 2, width: size.width, height: 2)), with: .color(.black.opacity(0.18)))
                y += 4
            }
        }
        .opacity(flicker)
        .onAppear {
            withAnimation(.easeInOut(duration: 2.5).repeatForever(autoreverses: true)) { flicker = 0.94 }
        }
    }
}

// Darkened edges (web radial vignette: transparent 52% -> black 0.55 at the far corner).
private struct Vignette: View {
    var body: some View {
        GeometryReader { geo in
            let r = hypot(geo.size.width, geo.size.height) / 2
            RadialGradient(
                stops: [.init(color: .clear, location: 0.52), .init(color: .black.opacity(0.55), location: 1.0)],
                center: .center, startRadius: 0, endRadius: r
            )
        }
    }
}

// A soft light band sweeping top -> bottom (50s/60s tube-TV refresh).
private struct ScanBar: View {
    @State private var y: CGFloat = -80
    var body: some View {
        GeometryReader { geo in
            LinearGradient(colors: [.clear, .white.opacity(0.03), .clear], startPoint: .top, endPoint: .bottom)
                .frame(height: 80)
                .offset(y: y)
                .onAppear {
                    y = -80
                    withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) { y = geo.size.height }
                }
        }
    }
}

// Animated film grain as a non-interactive blended overlay (preserves button/glass
// animations underneath, unlike a layerEffect). Monochrome, Gaussian-ish noise centered
// on mid-gray, composited with `.overlay` blend so the effect is luminance-dependent
// (peaks in midtones, fades in deep shadows/highlights) per the Yedlin grain model.
// A small pool of pre-generated tiles is cycled ~11fps for the reseed.
private struct GrainOverlay: View {
    let opacity: Double
    @State private var frames: [Image] = []
    @State private var idx = 0
    private let timer = Timer.publish(every: 0.09, on: .main, in: .common).autoconnect()

    var body: some View {
        Group {
            if !frames.isEmpty { frames[idx].resizable().interpolation(.none) }
        }
        .opacity(opacity)
        // `.screen` (not `.overlay`) so the grain is actually visible over the near-black
        // UI — a deliberate stylistic choice over strict film-science (which would fade
        // grain to nothing in the deep shadows that dominate this dark theme).
        .blendMode(.screen)
        .onAppear { if frames.isEmpty { frames = (0..<8).map { _ in Self.makeNoise() } } }
        .onReceive(timer) { _ in if frames.count > 1 { idx = (idx + 1) % frames.count } }
    }

    private static let ciContext = CIContext(options: nil)
    private static func makeNoise() -> Image {
        // Monochrome noise pushed to high contrast so it's mostly black (leaves the UI
        // untouched under `.screen`) with crisp bright specks that actually read as grain.
        let mono = (CIFilter.randomGenerator().outputImage ?? CIImage.empty())
            .applyingFilter("CIPhotoEffectMono")
            .applyingFilter("CIColorControls", parameters: [kCIInputContrastKey: 3.0, kCIInputBrightnessKey: -0.15])
        // Small crop scaled up by SwiftUI (~2.4x) → coarser, more visible grain, not 1px fizz.
        let crop = CGRect(x: CGFloat.random(in: 0...600), y: CGFloat.random(in: 0...600), width: 170, height: 360)
        guard let cg = ciContext.createCGImage(mono, from: crop) else { return Image(uiImage: UIImage()) }
        return Image(decorative: cg, scale: 1)
    }
}
