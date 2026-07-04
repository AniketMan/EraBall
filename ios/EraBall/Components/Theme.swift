// Theme.swift
// Design tokens matching tokens.ts exactly.

import SwiftUI

// MARK: - Color Tokens
enum G {
    static let gold      = Color(hex: "#C9A84C")
    static let goldHov   = Color(hex: "#E2C46A")
    static let goldDim   = Color(hex: "#7A6430")
    static let black     = Color(hex: "#000000")
    static let surface   = Color(hex: "#111111")
    static let surface2  = Color(hex: "#1A1A1A")
    static let border    = Color(hex: "#222222")
    static let borderSub = Color(hex: "#1A1A1A")
    static let white     = Color(hex: "#FFFFFF")
    static let grey      = Color(hex: "#888888")
    static let greyDark  = Color(hex: "#AAAAAA")
    static let red       = Color(hex: "#CC3333")
    static let purple    = Color(hex: "#9B6DFF")
    static let green     = Color(hex: "#4CAF78")
    static let blue      = Color(hex: "#4A9ECC")
    static let teal      = Color(hex: "#4ECDC4")
    static let pink      = Color(hex: "#F472B6")
}

// MARK: - Typography
enum Fonts {
    static func bebas(_ size: CGFloat) -> Font {
        .custom("BebasNeue-Regular", size: size)
    }
    static func inter(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .default)
    }
}

// MARK: - Grade Color
func gradeColor(_ grade: String) -> Color {
    switch grade {
    case "A+", "A": return Color(hex: "#4ade80")
    case "B+", "B": return Color(hex: "#86efac")
    case "C+", "C": return G.grey
    case "D+", "D": return Color(hex: "#fbbf24")
    default:        return G.red
    }
}

// MARK: - Era Label
func eraDisplayLabel(_ era: String) -> String {
    switch era {
    case "00s": return "2000s"
    case "10s": return "2010s"
    case "20s": return "2020s"
    default:    return era
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB,
                  red: Double(r) / 255,
                  green: Double(g) / 255,
                  blue: Double(b) / 255,
                  opacity: Double(a) / 255)
    }
}

// MARK: - Button Styles

/// Gold: bg #C9A84C, text black, uppercase tracking — matches .btn-gold
struct GoldButtonStyle: ButtonStyle {
    var fullWidth = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold))
            .tracking(2.0)
            .textCase(.uppercase)
            .foregroundStyle(G.black)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(configuration.isPressed ? G.goldHov : G.gold)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

/// Outline: transparent bg, gold border — matches .btn-outline
struct OutlineButtonStyle: ButtonStyle {
    var fullWidth = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold))
            .tracking(2.0)
            .textCase(.uppercase)
            .foregroundStyle(G.gold)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(configuration.isPressed ? G.gold.opacity(0.08) : Color.clear)
            .overlay(Rectangle().stroke(G.gold, lineWidth: 1))
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

/// Ghost: transparent bg, grey border — matches .btn-ghost
struct GhostButtonStyle: ButtonStyle {
    var fullWidth = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold))
            .tracking(2.0)
            .textCase(.uppercase)
            .foregroundStyle(G.grey)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(configuration.isPressed ? G.border.opacity(0.5) : Color.clear)
            .overlay(Rectangle().stroke(G.border, lineWidth: 1))
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

/// Purple: for Salary Cap mode — matches .btn-ghost with purple color
struct PurpleButtonStyle: ButtonStyle {
    var fullWidth = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold))
            .tracking(2.0)
            .textCase(.uppercase)
            .foregroundStyle(G.purple)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(configuration.isPressed ? G.purple.opacity(0.12) : Color.clear)
            .overlay(Rectangle().stroke(G.purple, lineWidth: 1))
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Divider
struct EraBallDivider: View {
    var body: some View {
        Rectangle()
            .fill(G.border)
            .frame(height: 1)
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    var body: some View {
        Text(title)
            .font(.system(size: 10, weight: .semibold))
            .tracking(3.0)
            .textCase(.uppercase)
            .foregroundStyle(G.greyDark)
    }
}
