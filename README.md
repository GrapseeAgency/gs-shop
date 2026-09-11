# Grapsee Shop

Digital-services mall: Next.js web + backend, native **Android** (Kotlin/Compose) and **iOS** (SwiftUI) apps.

## Download (no store needed)

**Latest release (APK + IPA): https://github.com/GrapseeAgency/gs-shop/releases/latest**
— open it on the phone, download, install. The apps update themselves afterwards.

## Status

| Check | Status |
|---|---|
| Android | [![Android](https://github.com/GrapseeAgency/gs-shop/actions/workflows/android.yml/badge.svg)](https://github.com/GrapseeAgency/gs-shop/actions/workflows/android.yml) |
| iOS | [![iOS](https://github.com/GrapseeAgency/gs-shop/actions/workflows/ios.yml/badge.svg)](https://github.com/GrapseeAgency/gs-shop/actions/workflows/ios.yml) |
| Servers | [![Keep-alive](https://github.com/GrapseeAgency/gs-shop/actions/workflows/keepalive.yml/badge.svg)](https://github.com/GrapseeAgency/gs-shop/actions/workflows/keepalive.yml) |

## Ship a release

```bash
git tag v1.0.6 && git push origin v1.0.6
```

Actions builds both apps, publishes the Release, and every installed app
offers the update itself (Android downloads + installs in-app, iOS opens the
release/TestFlight page). See [.github/RELEASE.md](.github/RELEASE.md).

## Keep the servers always up

GitHub is the watchdog via the self-hosted `grapsee` runner on the server machine:

```bash
# one time, on that machine:
GH_PAT=<repo-scope-token> bash scripts/setup-runner.sh
```

- `server.yml` — every push to the web code rebuilds + restarts the stack.
- `keepalive.yml` — every 10 min probes `/api/health` + web root; restarts
  what is down; opens a `🔴 Servers down` issue if recovery fails.
- Manual: `scripts/serve.sh {start [--build]|stop|check|status}`, logs in `logs/`.
