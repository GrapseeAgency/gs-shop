import SwiftUI

// MARK: - Grapsee design tokens
// Measured sRGB conversions of shop-frontend globals.css OKLCH values.
// Apply `.accentColor(Theme.brand)` once at the app root so every
// `Color.accentColor` call site resolves to Jade, light + dark.

enum Theme {
    static let brand = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? UIColor(red: 0x25/255, green: 0xCA/255, blue: 0x7F/255, alpha: 1)
                                      : UIColor(red: 0x00/255, green: 0xAA/255, blue: 0x69/255, alpha: 1)
    })
    static let background = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? UIColor(red: 0x01/255, green: 0x04/255, blue: 0x02/255, alpha: 1) : .white
    })
    static let foreground = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? UIColor(red: 0xED/255, green: 0xF4/255, blue: 0xF0/255, alpha: 1)
                                      : UIColor(red: 0x02/255, green: 0x07/255, blue: 0x04/255, alpha: 1)
    })
    static let muted = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? UIColor(white: 0x0B/255, alpha: 1) : UIColor(white: 0xEF/255, alpha: 1)
    })
    static let mutedInk = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? UIColor(red: 0x75/255, green: 0x8D/255, blue: 0x80/255, alpha: 1)
                                      : UIColor(white: 0x5B/255, alpha: 1)
    })
    static let danger = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? UIColor(red: 1, green: 0x64/255, blue: 0x67/255, alpha: 1)
                                      : UIColor(red: 0xE7/255, green: 0, blue: 0x0B/255, alpha: 1)
    })

    enum Radius {
        static let chip: CGFloat = 20
        static let card: CGFloat = 16
        static let button: CGFloat = 12
        static let tile: CGFloat = 14
        static let thumb: CGFloat = 10
    }
}
