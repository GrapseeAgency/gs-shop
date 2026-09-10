package com.grapsee.shop.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape

// Web shape scale: --radius 0.75rem (12px); cards read as xl/2xl.
object GrapseeShapes {
    val chip = RoundedCornerShape(20.dp)
    val pill = RoundedCornerShape(50)
    val card = RoundedCornerShape(16.dp)
    val sheet = RoundedCornerShape(18.dp)
    val button = RoundedCornerShape(12.dp)
    val tile = RoundedCornerShape(14.dp)
    val thumb = RoundedCornerShape(10.dp)
}

private val LightColors = lightColorScheme(
    primary = Jade,
    onPrimary = Color.White,
    primaryContainer = Seafoam,
    onPrimaryContainer = Color(0xFF003B26),
    secondary = Color(0xFFF0F0F0),
    onSecondary = InkLight,
    secondaryContainer = AccentSoft,
    onSecondaryContainer = InkLight,
    tertiary = Emerald,
    onTertiary = Color.White,
    background = Color.White,
    onBackground = InkLight,
    surface = Color.White,
    onSurface = InkLight,
    surfaceVariant = MutedLight,
    onSurfaceVariant = MutedInkLight,
    outline = Color(0xFFD8DCD9),
    outlineVariant = Color(0xFFE5E9E6),
    error = SignalRed,
    onError = Color.White,
)

private val DarkColors = darkColorScheme(
    primary = JadeDark,
    onPrimary = Color(0xFF003916),
    primaryContainer = Color(0xFF00532A),
    onPrimaryContainer = Mint,
    secondary = MutedDark,
    onSecondary = InkDark,
    secondaryContainer = AccentSoftDark,
    onSecondaryContainer = InkDark,
    tertiary = Emerald,
    onTertiary = Color(0xFF00390E),
    background = PaperDark,
    onBackground = InkDark,
    surface = PaperDark,
    onSurface = InkDark,
    surfaceVariant = MutedDark,
    onSurfaceVariant = MutedInkDark,
    outline = Color(0xFF3F4943),
    outlineVariant = Color(0xFF2A332E),
    error = SignalRedDark,
    onError = Color(0xFF690005),
)

@Composable
fun GrapseeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = GrapseeTypography,
        content = content,
    )
}
