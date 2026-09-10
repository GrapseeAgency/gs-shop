plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.grapsee.shop"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.grapsee.shop"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        // Production endpoints. Override at build time with
        //   gradle assembleRelease -PapiUrl=... -PwebUrl=...
        // Debug overrides below point at a locally running stack
        // (web on :3002, backend on :3000 via the emulator's 10.0.2.2 loopback).
        buildConfigField("String", "API_BASE_URL", "\"${project.findProperty("apiUrl") ?: "https://api.captainpiracy.shop"}\"")
        buildConfigField("String", "WEB_BASE_URL", "\"${project.findProperty("webUrl") ?: "https://captainpiracy.shop"}\"")
        // Live-updater source: the public GitHub repo whose Releases carry the APK.
        // Override with: gradle assembleRelease -PupdateOwner=you -PupdateRepo=grapsee
        buildConfigField("String", "UPDATE_OWNER", "\"${project.findProperty("updateOwner") ?: "OWNER"}\"")
        buildConfigField("String", "UPDATE_REPO", "\"${project.findProperty("updateRepo") ?: "REPO"}\"")
    }

    signingConfigs {
        create("release") {
            storeFile = rootProject.file("grapsee-release.jks")
            storePassword = System.getenv("GRAPSEE_STORE_PASS") ?: "grapsee2026"
            keyAlias = "grapsee"
            keyPassword = System.getenv("GRAPSEE_KEY_PASS") ?: "grapsee2026"
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            // This PC's WiFi LAN IP — phones on the same network reach the dev
            // stack directly (10.0.2.2 is emulator-only loopback).
            buildConfigField("String", "API_BASE_URL", "\"http://192.168.43.79:3000\"")
            buildConfigField("String", "WEB_BASE_URL", "\"http://192.168.43.79:3002\"")
        }
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.5")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-core")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.coil-kt:coil-compose:2.7.0")

    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.biometric:biometric:1.1.0")
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Push is dormant until a google-services.json is dropped in (see README).
    // FirebaseApp init is guarded in code, so the build stays green without it.
    implementation("com.google.firebase:firebase-messaging:24.1.0")
}
