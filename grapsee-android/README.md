# Grapsee Android (grapsee-android)

Native Android app for Grapsee Shop — **Kotlin + Jetpack Compose**, built against the
existing `shop-backend` Next.js API, with the existing `shop-frontend` Next.js app
rendered inside a hardened WebView for the long tail of pages.

## Architecture in one paragraph

This is a **hybrid by design, native where it counts**. The bottom navigation, home,
search, product detail, category, cart, orders, login and profile are **real Compose
screens** talking directly to the backend API. Every other route of the ~280-page web
app opens in a hardened WebView (`WebViewScreen`) with the session cookie synced both
ways, a JS bridge for native features, and a native error/offline state. Converting a
new page to native later is additive — the WebView is the permanent fallback, not
scaffolding to be torn down.

```
Kotlin/Compose app
├── Native screens (Home, Search, Product, Category, Cart, Orders, Login, Profile)
│     └── OkHttp + kotlinx-serialization → {API_BASE_URL}/api/*
├── Hardened WebView screens (all remaining routes, checkout handoff)
│     ├── session cookie sync (native ⇄ web)
│     ├── window.GrapseeNative bridge (share, haptics, push token, biometric…)
│     └── native progress / error / download handling
├── Session: NextAuth cookie jar (EncryptedSharedPreferences), no Bearer tokens
├── Cart: local DataStore mirror of the web's zustand cart (same shapes)
└── Push: FCM service (dormant until google-services.json is added)
```

## Building & running

```bash
# from this directory
gradle assembleDebug          # APK at app/build/outputs/apk/debug/
gradle installDebug           # onto a connected device/emulator
```

Or open the folder in Android Studio and press Run.

**Environment switch** is in `app/build.gradle.kts`:

| Build   | API_BASE_URL            | WEB_BASE_URL          |
|---------|-------------------------|-----------------------|
| debug   | `http://10.0.2.2:3000`  | `http://10.0.2.2:3002`|
| release | `https://api.captainpiracy.shop` | `https://captainpiracy.shop` |

Debug builds talk to your **locally running** stack through the emulator's loopback
(`10.0.2.2` = your machine). Start `shop-backend` (`next dev -p 3000`) and
`shop-frontend` (`next dev -p 3002`) first. Note: as of writing the local backend
errors if its Postgres isn't up, and the prod API deployment was returning 404 —
fix whichever you target before expecting data.

`applicationIdSuffix = ".debug"` means debug and release installs coexist on a device.

## The native ⇄ web contract

**Detecting the app from web code:** `window.GrapseeNative` exists, plus a
`GrapseeAndroid/x.y` user-agent suffix and `window.GrapseeNativeInfo`.

**Bridge API** (registered as `window.GrapseeNative`):

| Method | Notes |
|---|---|
| `isNativeApp()` | `true` |
| `platform()` / `appVersion()` | `"android"` / versionName |
| `share(title, url)` | system share sheet |
| `toast(message)` | native toast |
| `haptic()` | 12 ms vibration |
| `copyToClipboard(text)` | + confirmation toast |
| `openInBrowser(url)` | external browser |
| `pushToken()` | FCM token (empty until Firebase configured) |
| `authenticateBiometric(reason, callbackId)` | dispatches `grapsee-biometric` CustomEvent `{id, success}` on `window` |

**Session:** the NextAuth `next-auth.session-token` cookie lives in an encrypted
persistent cookie jar (`CookieStore`). It is pushed into the WebView before every
load and captured back after every navigation — logging in natively logs you into
the web views and vice versa. Login runs the real NextAuth credentials flow
(`/api/auth/csrf` → `/api/auth/callback/credentials` → `/api/auth/session`).

**Cart:** the web cart is client-side zustand (`grapsee-shop-cart` in localStorage);
the native cart mirrors the same line-item shape in DataStore. When you tap
**Go to checkout**, `WebViewScreen(cartHandoff = true)` seeds the web origin's
localStorage with the native cart before loading `/checkout/preview`, so the web
checkout sees exactly what you built natively. Reaching `/order-success` clears the
native cart.

## Converting the next page to native (the playbook)

Each conversion is one screen file + one route entry. `CategoryScreen` is the
smallest complete reference; `ProductScreen` is the richest.

1. **Create `features/<name>/<Name>Screen.kt`** with a `data class <Name>UiState`,
   a `class <Name>ViewModel : ViewModel()` (load via `ApiClient`, expose
   `var ui by mutableStateOf(...)`), and the `@Composable` screen.
2. **Add the endpoint** to `core/network/ApiClient.kt` if missing (all requests are
   thin OkHttp wrappers over `get/post/put/delete`; parse with `Wire.parseProducts`
   / `Wire.json.decodeFromString`).
3. **Register the route** in `navigation/Nav.kt`:
   ```kotlin
   composable("product/{productId}", arguments = listOf(navArgument("productId") { type = NavType.StringType })) {
       ProductScreen(productId = it.arguments?.getString("productId").orEmpty(), ...)
   }
   ```
4. **Point links at it** — anywhere that currently calls `onWeb("/some-page")`
   switches to `navController.navigate(...)`.
5. Nothing else. The WebView keeps serving that URL fine for any entry point you
   miss (deep link, old build, web-only flow).

### Suggested conversion order (by real usage, not page count)

`orders detail` → `wishlist` → `checkout/payment` (Play Billing) → `notifications`
→ `order-tracking` → `blog` → `reviews`. **Stop converting when the top ~20
sessions-carrying routes are native**; the tail stays in the WebView permanently —
that's the design, not debt.

## Activating the dormant pieces

**Push (FCM):** drop `google-services.json` into `app/`, add
`id("com.google.gms.google-services") version "4.4.2"` to root+app `plugins`, done —
`GrapseeApp`, the manifest service and `PushManager` are already wired and guarded so
the build stays green either way.

**App Links:** `AndroidManifest.xml` already declares
`https://captainpiracy.shop/product/*` etc. with `autoVerify`. Host
`assetlinks.json` at `https://captainpiracy.shop/.well-known/assetlinks.json` with
the SHA-256 of your release keystore (`keytool -list -printcert -jarfile app-release.apk`).

**Signing release:** add a `signingConfigs` block with your keystore, then
`gradle assembleRelease`.

## Known v1 limitations (honest list)

- **No emulator ran this** — it compiles clean (`assembleDebug`, 15 MB APK,
  minSdk 26 / targetSdk 35), but do a device pass before shipping: cookie sync,
  checkout handoff, and bridge calls are the paths to test.
- **Registration** isn't in the backend (only login); the app's SSO button is
  disabled and points you to grapsee.com via the web view on the Profile screen.
- The backend's `/api/orders` accepts an `?email=` param with no auth check — the
  app only ever queries the session user's own email, but the endpoint itself is loose.
- Order detail is still web (`/orders/[id]`); the native Orders list doesn't link it yet.
- The home hero slides are static placeholders; mirror `src/components/shop/hero.tsx`
  when you want exact parity.
