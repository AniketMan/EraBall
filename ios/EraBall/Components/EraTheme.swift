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
            .overlay { EraThemeOverlay(era: (on ? era : nil)).ignoresSafeArea() }
    }
}

// MARK: - Color grade (web `eraFilter`)

private struct EraColorGrade: ViewModifier {
    let era: String?
    func body(content: Content) -> some View {
        switch era {
        case "50s": AnyView(content.grayscale(1.0))
        case "60s": AnyView(content.saturation(0.82))
        case "70s": AnyView(content.saturation(0.88).contrast(0.94).brightness(-0.03))
        case "10s": AnyView(content.saturation(1.15).contrast(1.06).brightness(0.02))
        default:    AnyView(content)
        }
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
                    GrainOverlay(opacity: era == "50s" ? 0.19 : 0.09)
                }
                if era == "60s" {
                    Color(red: 1.0, green: 220/255, blue: 80/255).opacity(0.05)
                }
                if era == "00s" {
                    GrainOverlay(opacity: 0.15)
                    Color(red: 1.0, green: 175/255, blue: 70/255).opacity(0.06)
                    Vignette()
                }
                if era == "10s" {
                    GrainOverlay(opacity: 0.10)
                    Color(red: 1.0, green: 200/255, blue: 90/255).opacity(0.03)
                }
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

// Animated film/VHS grain — a small pool of pre-generated noise tiles cycled ~11fps,
// screen-blended, approximating the web feTurbulence reseed.
private struct GrainOverlay: View {
    let opacity: Double
    @State private var frames: [Image] = []
    @State private var idx = 0
    private let timer = Timer.publish(every: 0.09, on: .main, in: .common).autoconnect()

    var body: some View {
        Group {
            if !frames.isEmpty {
                frames[idx].resizable().interpolation(.none)
            }
        }
        .opacity(opacity)
        .blendMode(.screen)
        .onAppear { if frames.isEmpty { frames = (0..<8).map { _ in Self.makeNoise() } } }
        .onReceive(timer) { _ in if frames.count > 1 { idx = (idx + 1) % frames.count } }
    }

    private static let ciContext = CIContext(options: nil)
    private static func makeNoise() -> Image {
        let noise = CIFilter.randomGenerator().outputImage ?? CIImage.empty()
        let mono = noise.applyingFilter("CIPhotoEffectMono")
        let crop = CGRect(x: CGFloat.random(in: 0...512), y: CGFloat.random(in: 0...512), width: 320, height: 640)
        guard let cg = ciContext.createCGImage(mono, from: crop) else {
            return Image(uiImage: UIImage())
        }
        return Image(decorative: cg, scale: 1)
    }
}
