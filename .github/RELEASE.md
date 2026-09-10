# Release & Live Update

One pipeline builds **both apps** and publishes them to a **GitHub Release**.
Phones pick up new versions through the in-app updater — no store needed
for Android; iOS follows Apple's rules (TestFlight / App Store / ad-hoc).

## Ship a release (3 commands)

```bash
git tag v1.1.0
git push origin v1.1.0
# → Actions builds both apps → Release "v1.1.0" with APK (+ IPA when signed)
```

Both apps are stamped with the tag (`1.1.0`) and the repo slug, so the
updaters immediately see the new release. `versionCode` / build number is
`github.run_number` (always increasing).

## What users see

**Android:** on launch (release builds only) the app checks
`GET /repos/{owner}/{repo}/releases/latest`. If the tag is newer: dialog
*"🎉 New version — hey, your app has a new version!"* → **Update now** →
progress **0–100%** → system installer opens. First time, Android asks to
*Allow install unknown apps for Grapsee* (the "unknown resource" prompt) —
after enabling, the install proceeds automatically. Same flow is available
manually under **Profile → Settings → Check for updates**.

**iOS:** Apple forbids silent sideloading, so the iPhone flow is check →
*"new version available"* → **Update now** opens the release page (or the
TestFlight link if `testFlightURL` is set in `UpdateChecker.swift`).

## First-time setup (repo owner does this once)

1. Create the public repo and push:
   `git remote add origin https://github.com/YOU/grapsee-shop.git`
   `git push -u origin main`
2. Optional but recommended secrets (`Settings → Secrets → Actions`):
   - `GRAPSEE_KEYSTORE_B64` — `base64 -w0 grapsee-android/grapsee-release.jks`
     (without it CI falls back to the committed keystore — **rotate it**,
     the password `grapsee2026` is in build history),
   - `GRAPSEE_STORE_PASS` / `GRAPSEE_KEY_PASS`,
   - `PROD_API_URL` / `PROD_WEB_URL` repo variables (release endpoints;
     defaults are `https://api.captainpiracy.shop` /
     `https://captainpiracy.shop` — the updater needs no backend, but the
     app does).
3. iOS distribution (Apple's rules, verified against Apple Developer docs):
   - CI **always** validates the build unsigned (`CODE_SIGNING_ALLOWED=NO`).
   - For installable IPAs add: `APPLE_TEAM_ID`, `APPLE_DIST_P12_B64`
     (distribution .p12), `APPLE_DIST_P12_PASSWORD`,
     `APPLE_KEYCHAIN_PASSWORD`. The workflow exports an **ad-hoc** IPA
     (registered devices only) attached to the same release.
   - For everyone else: upload the build to **TestFlight** (needs the paid
     Developer Program) and put its public link in
     `grapsee-ios/GrapseeShop/Core/UpdateChecker.swift` → `testFlightURL`.
     Without any Apple signing there is no way to install an IPA on a
     stock iPhone — that is Apple's restriction, not a bug in this setup.

## Workflows

| File | Trigger | Does |
|---|---|---|
| `android.yml` | push/PR touching `grapsee-android/` | debug + signed release APK, uploaded as artifacts |
| `ios.yml` | push/PR touching `grapsee-ios/` | unsigned Release build validation |
| `release.yml` | tag `v*.*.*` (or manual) | stamps versions, builds both, publishes Release |

## Local release check

```bash
cd grapsee-android
./gradlew assembleRelease -PupdateOwner=YOU -PupdateRepo=grapsee-shop
```
