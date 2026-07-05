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
            .modifier(FilmGrainEffect(era: (on ? era : nil)))   // luminance-dependent grain on the graded content
            .overlay { EraThemeOverlay(era: (on ? era : nil)).ignoresSafeArea() }
    }
}

// MARK: - Film grain (Yedlin luminance-dependent model, GPU shader)

private struct FilmGrainEffect: ViewModifier {
    let era: String?

    // Per-era grain strength (was the old overlay opacity; here it's the shader amplitude).
    private var amount: Float? {
        switch era {
        case "50s": return 0.19
        case "60s", "70s", "80s", "90s": return 0.09
        case "00s": return 0.15
        case "10s": return 0.10
        default: return nil
        }
    }

    func body(content: Content) -> some View {
        if let amount {
            // ~24fps film cadence (not 120Hz ProMotion) to keep the animated redraw cheap.
            TimelineView(.animation(minimumInterval: 1.0 / 24.0)) { tl in
                let t = Float(tl.date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: 1000))
                content.layerEffect(
                    ShaderLibrary.filmGrain(.float(t), .float(amount)),
                    maxSampleOffset: .zero
                )
            }
        } else {
            content
        }
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
            // Grain is applied as a luminance-dependent GPU layerEffect on the content
            // (see FilmGrainEffect), not as a blended overlay here.
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

}
