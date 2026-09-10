package com.grapsee.shop.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Jade,
    onPrimary = Color.White,
    primaryContainer = Seafoam,
    onPrimaryContainer = Color(0xFF003B26),
    secondary = Color(0xFFF2F3F2),
    onSecondary = Color(0xFF1B1E1C),
    secondaryContainer = Color(0xFFE0E5E1),
    onSecondaryContainer = Color(0xFF161A18),
    tertiary = Emerald,
    onTertiary = Color.White,
    background = Color.White,
    onBackground = Color(0xFF161A18),
    surface = Color.White,
    onSurface = Color(0xFF161A18),
    surfaceVariant = Color(0xFFF2F3F2),
    onSurfaceVariant = Color(0xFF404944),
    outline = Color(0xFFD8DCD9),
    outlineVariant = Color(0xFFE5E9E6),
    error = Color(0xFFBA1A1A),
    onError = Color.White,
)

private val DarkColors = darkColorScheme(
    primary = Malachite,
    onPrimary = Color(0xFF003916),
    primaryContainer = Color(0xFF00532A),
    onPrimaryContainer = Mint,
    secondary = Color(0xFF1E2622),
    onSecondary = Color(0xFFDEE4DF),
    secondaryContainer = Color(0xFF2A332E),
    onSecondaryContainer = Color(0xFFD5DBD6),
    tertiary = Emerald,
    onTertiary = Color(0xFF00390E),
    background = Color(0xFF0F1512),
    onBackground = Color(0xFFDEE4DF),
    surface = Color(0xFF0F1512),
    onSurface = Color(0xFFDEE4DF),
    surfaceVariant = Color(0xFF1E2622),
    onSurfaceVariant = Color(0xFFBCC9C1),
    outline = Color(0xFF3F4943),
    outlineVariant = Color(0xFF2A332E),
    error = Color(0xFFFFB4AB),
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
