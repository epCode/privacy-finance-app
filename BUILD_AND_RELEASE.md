# Personal Finance Tracker - Build & Release Guide

This guide covers building and releasing the Personal Finance Tracker across all platforms: Linux, Windows, macOS, Android, and iOS.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Desktop Builds](#desktop-builds)
- [Mobile Builds](#mobile-builds)
- [Automated GitHub Actions Releases](#automated-github-actions-releases)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Global Requirements

- **Node.js** 22+ ([download](https://nodejs.org/))
- **pnpm** 10+ (`npm install -g pnpm`)
- **Git** ([download](https://git-scm.com/))
- **Rust** 1.77.2+ ([install via rustup](https://rustup.rs/))

### Platform-Specific Requirements

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

#### Windows
- **Visual Studio Build Tools** or **Visual Studio Community** with "Desktop development with C++" workload.

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`

#### Android
- **Java 17+**
- **Android SDK**
- **NDK** and **Rust Android Targets**:
  ```bash
  rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
  ```

#### iOS
- **Xcode 15+** (macOS only)
- **Rust iOS Targets**:
  ```bash
  rustup target add aarch64-apple-ios aarch64-apple-ios-sim
  ```

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/epCode/Offline-Pennies.git
cd Offline-Pennies

# Install dependencies
pnpm install

# Start development server (web)
pnpm dev
```

## Desktop Builds

### Linux

```bash
# Build for Linux (AppImage + .deb)
pnpm build
pnpm tauri build --target x86_64-unknown-linux-gnu

# Output locations:
# - AppImage: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/
# - Debian: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/
```

### Windows

```bash
# Build for Windows (MSI + Portable)
pnpm build
pnpm tauri build --target x86_64-pc-windows-msvc

# Output locations:
# - MSI: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/
# - Portable EXE: src-tauri/target/x86_64-pc-windows-msvc/release/
```

### macOS

#### Intel (x86_64)

```bash
# Build for Intel Macs
pnpm build
pnpm tauri build --target x86_64-apple-darwin

# Create DMG
cd src-tauri/target/x86_64-apple-darwin/release/bundle/macos
hdiutil create -volname "Personal Finance Tracker" -srcfolder . -ov -format UDZO Personal-Finance-Tracker-x86_64.dmg
```

#### Apple Silicon (ARM64)

```bash
# Build for Apple Silicon Macs
pnpm build
pnpm tauri build --target aarch64-apple-darwin

# Create DMG
cd src-tauri/target/aarch64-apple-darwin/release/bundle/macos
hdiutil create -volname "Personal Finance Tracker" -srcfolder . -ov -format UDZO Personal-Finance-Tracker-arm64.dmg
```

## Mobile Builds

The project uses Tauri v2 for mobile support.

### Android

```bash
# Initialize Android project (first time)
pnpm tauri android init

# Build APK
pnpm build
pnpm tauri build --target android
```

### iOS

```bash
# Initialize iOS project (first time)
pnpm tauri ios init

# Build IPA
pnpm build
pnpm tauri build --target ios
```

## Automated GitHub Actions Releases

The `build-release.yml` workflow automatically triggers when:
- A tag matching `v*.*.*` is pushed (e.g., `v1.0.0`)
- Manually triggered via GitHub Actions UI

### Release Process

1. **Create Release** - GitHub Release is created automatically.
2. **Build Desktop Apps** - Parallel builds for Linux, Windows, macOS.
3. **Build Mobile Apps** - Android and iOS builds.
4. **Upload Artifacts** - All builds automatically uploaded to GitHub Release.

## Troubleshooting

### Linux Build Issues
- Ensure `libwebkit2gtk-4.1-dev` is installed for Tauri v2.

### macOS Build Issues
- For mobile builds, ensure Xcode is correctly configured with a development team.

### Android Build Issues
- Ensure `ANDROID_HOME` and `JAVA_HOME` environment variables are set.

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/epCode/Offline-Pennies/issues)
- Tauri Docs: [https://tauri.app/](https://tauri.app/)
