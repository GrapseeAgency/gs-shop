package com.grapsee.shop

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.rememberNavController
import com.grapsee.shop.navigation.GrapseeAppRoot
import com.grapsee.shop.ui.theme.GrapseeTheme

/**
 * Single-activity Compose app. AppCompatActivity (not ComponentActivity)
 * because the JS bridge uses BiometricPrompt, which requires FragmentActivity.
 */
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GrapseeTheme {
                GrapseeAppRoot(navController = rememberNavController())
            }
        }
    }
}
