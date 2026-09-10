package com.grapsee.shop.ui.theme

import androidx.compose.ui.graphics.Color

// Measured sRGB conversions of the web brand palette (shop-frontend
// globals.css OKLCH values). Do not hand-tune: regenerate from the CSS.
val Jade = Color(0xFF00AA69)          // oklch(0.637 0.176 162) primary light
val JadeDark = Color(0xFF25CA7F)      // oklch(0.741 0.168 157) primary dark
val Emerald = Color(0xFF50C878)
val Viridian = Color(0xFF40826D)
val Bottle = Color(0xFF006A4E)
val Hunter = Color(0xFF355E3B)
val Seafoam = Color(0xFF93E9BE)
val Mint = Color(0xFF98FF98)

// Kept for callers referencing the old dark-primary name.
val Malachite = JadeDark

// Measured neutrals.
val InkLight = Color(0xFF020704)      // oklch(0.12 0.015 162) foreground light
val PaperDark = Color(0xFF010402)     // oklch(0.095 0.014 162) background dark
val InkDark = Color(0xFFEDF4F0)       // oklch(0.96 0.009 162) foreground dark
val MutedLight = Color(0xFFEFEFEF)    // oklch(0.952 0 0)
val MutedInkLight = Color(0xFF5B5B5B) // oklch(0.47 0 0)
val MutedDark = Color(0xFF0B1510)     // oklch(0.185 0.018 162)
val MutedInkDark = Color(0xFF758D80)  // oklch(0.62 0.034 162)
val AccentSoft = Color(0xFFE1E1E1)    // oklch(0.91 0 0) accent light
val AccentSoftDark = Color(0xFF1C1C1C)// oklch(0.228 0 0) accent dark
val SignalRed = Color(0xFFE7000B)     // oklch(0.577 0.245 27.325) destructive light
val SignalRedDark = Color(0xFFFF6467) // oklch(0.704 0.191 22.216) destructive dark
