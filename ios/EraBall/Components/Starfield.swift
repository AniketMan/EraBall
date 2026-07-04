// Starfield.swift
// Animated warp-speed starfield matching the web era-select background
// (page.tsx canvas starfield: stars stream outward from center with trails).

import SwiftUI

struct Starfield: View {
    private struct Star {
        var x: Double   // -1...1 relative to center
        var y: Double
        var z: Double   // depth 0..1 (small = close)
        var seed: Double
    }

    private static let stars: [Star] = (0..<140).map { _ in
        Star(x: .random(in: -1...1), y: .random(in: -1...1), z: .random(in: 0.02...1), seed: .random(in: 0...1))
    }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { timeline in
            Canvas { context, size in
                let t = timeline.date.timeIntervalSinceReferenceDate * 0.055
                let cx = size.width / 2
                let cy = size.height / 2
                let focal = size.width * 0.5

                for star in Self.stars {
                    // Each star loops through depth over time.
                    var z = (star.z - t - star.seed).truncatingRemainder(dividingBy: 1)
                    if z < 0 { z += 1 }
                    z = max(z, 0.03)

                    let sx = cx + (star.x * focal) / z * 0.55
                    let sy = cy + (star.y * focal) / z * 0.55
                    guard sx > -60, sx < size.width + 60, sy > -60, sy < size.height + 60 else { continue }

                    let prog = 1 - z
                    let radius = max(0.3, prog * 2.2)
                    let opacity = 0.15 + prog * 0.85

                    // Trail: line from a slightly deeper depth toward current position.
                    let zPrev = min(z + 0.028, 1)
                    let px = cx + (star.x * focal) / zPrev * 0.55
                    let py = cy + (star.y * focal) / zPrev * 0.55
                    var trail = Path()
                    trail.move(to: CGPoint(x: px, y: py))
                    trail.addLine(to: CGPoint(x: sx, y: sy))
                    context.stroke(trail, with: .color(.white.opacity(opacity * 0.5)), lineWidth: radius * 0.8)

                    let dot = CGRect(x: sx - radius, y: sy - radius, width: radius * 2, height: radius * 2)
                    context.fill(Circle().path(in: dot), with: .color(.white.opacity(opacity)))
                }
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}
