package com.grapsee.shop.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.grapsee.shop.R

// Inter, the same family the web app loads; bundled so the app renders it offline.
val Inter = FontFamily(
    Font(R.font.inter_400, FontWeight.Normal),
    Font(R.font.inter_500, FontWeight.Medium),
    Font(R.font.inter_600, FontWeight.SemiBold),
    Font(R.font.inter_700, FontWeight.Bold),
)

private fun style(family: FontFamily, weight: FontWeight, size: Int, line: Int) = TextStyle(
    fontFamily = family,
    fontWeight = weight,
    fontSize = size.sp,
    lineHeight = line.sp,
)

val GrapseeTypography = Typography(
    headlineLarge = style(Inter, FontWeight.Bold, 32, 38),
    headlineMedium = style(Inter, FontWeight.Bold, 28, 34),
    headlineSmall = style(Inter, FontWeight.SemiBold, 24, 30),
    titleLarge = style(Inter, FontWeight.SemiBold, 20, 26),
    titleMedium = style(Inter, FontWeight.SemiBold, 16, 22),
    titleSmall = style(Inter, FontWeight.Medium, 14, 20),
    bodyLarge = style(Inter, FontWeight.Normal, 16, 24),
    bodyMedium = style(Inter, FontWeight.Normal, 14, 20),
    bodySmall = style(Inter, FontWeight.Normal, 12, 16),
    labelLarge = style(Inter, FontWeight.SemiBold, 14, 20),
    labelMedium = style(Inter, FontWeight.Medium, 12, 16),
    labelSmall = style(Inter, FontWeight.Medium, 11, 14),
)
