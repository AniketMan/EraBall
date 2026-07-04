import SwiftUI

enum Theme {
    static let gold = Color(hex: 0xC9A84C)
    static let goldHov = Color(hex: 0xE2C46A)
    static let goldDim = Color(hex: 0x7A6430)
    static let black = Color(hex: 0x000000)
    static let surface = Color(hex: 0x111111)
    static let surface2 = Color(hex: 0x1A1A1A)
    static let border = Color(hex: 0x222222)
    static let borderSub = Color(hex: 0x1A1A1A)
    static let white = Color(hex: 0xFFFFFF)
    static let grey = Color(hex: 0x888888)
    static let greyDark = Color(hex: 0xAAAAAA)
    static let red = Color(hex: 0xCC3333)
    static let capPurple = Color(hex: 0x9B6DFF)
    
    static let bebasFont = Font.custom("Bebas Neue", size: 16, relativeTo: .body)
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 08) & 0xff) / 255,
            blue: Double((hex >> 00) & 0xff) / 255,
            opacity: alpha
        )
    }
}

// iOS 26 Liquid Glass Modifiers
extension View {
    func glassButton(isPrimary: Bool = false, tint: Color? = nil) -> some View {
        self
            .buttonStyle(isPrimary ? .glassProminent : .glass)
            .tint(tint ?? Theme.gold)
    }
    
    func glassCard() -> some View {
        self.glassEffect(.regular, in: RoundedRectangle(cornerRadius: 12))
    }
    
    func eraBallScreen() -> some View {
        self
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.black.ignoresSafeArea())
            .preferredColorScheme(.dark)
    }
}
