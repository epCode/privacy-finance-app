# Quick Start - Building Personal Finance Tracker

## For End Users (Download Pre-Built)

1. Go to [GitHub Releases](https://github.com/yourusername/personal-finance-tracker/releases)
2. Download the version for your platform:
   - **Linux**: `personal-finance-tracker-linux-x64.AppImage`
   - **Windows**: `personal-finance-tracker-windows-x64.exe`
   - **macOS Intel**: `personal-finance-tracker-macos-intel.dmg`
   - **macOS Apple Silicon**: `personal-finance-tracker-macos-arm64.dmg`
   - **Android**: `personal-finance-tracker-android.apk`
   - **iOS**: `personal-finance-tracker-ios.ipa`

## For Developers (Build Locally)

### Prerequisites

```bash
# Install Node.js 22+
# Install pnpm
npm install -g pnpm

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Setup

```bash
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
pnpm install
```

### Web Development

```bash
# Start dev server
pnpm dev

# Build for web
pnpm build
```

### Desktop Development

```bash
# Development (with hot reload)
pnpm tauri:dev

# Build for current platform
pnpm tauri:build

# Build for specific platform
pnpm tauri:build -- --target x86_64-unknown-linux-gnu  # Linux
pnpm tauri:build -- --target x86_64-pc-windows-msvc    # Windows
pnpm tauri:build -- --target x86_64-apple-darwin       # macOS Intel
pnpm tauri:build -- --target aarch64-apple-darwin      # macOS ARM64
```

### Mobile Development

```bash
# Android
mkdir -p mobile && cd mobile
npx create-expo-app personal-finance-tracker
cd personal-finance-tracker
npm install
npx eas build --platform android --local

# iOS (macOS only)
mkdir -p mobile && cd mobile
npx create-expo-app personal-finance-tracker
cd personal-finance-tracker
npm install
npx eas build --platform ios --local
```

## For Release Managers (Automated Builds)

### Create Release

```bash
# Update version
vim package.json
vim src-tauri/tauri.conf.json

# Commit
git add .
git commit -m "Bump version to v1.0.0"
git push origin main

# Create tag (triggers automated builds)
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Monitor Build

1. Go to GitHub Actions
2. Watch "Build and Release All Platforms" workflow
3. All platforms build in parallel (~30 minutes)

### Download Artifacts

Once complete, go to GitHub Releases and download all platform builds.

## Platform-Specific Setup

### Linux

```bash
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

### Windows

- Install Visual Studio Build Tools with C++ support
- Or Visual Studio Community with C++ workload

### macOS

```bash
xcode-select --install
```

### Android

```bash
npm install -g eas-cli
# Follow EAS setup: npx eas init
```

### iOS

```bash
npm install -g eas-cli
sudo gem install cocoapods
# Follow EAS setup: npx eas init
```

## Build Outputs

### Desktop

```
src-tauri/target/[target]/release/bundle/
├── appimage/          # Linux AppImage
├── deb/               # Linux Debian package
├── msi/               # Windows MSI installer
├── nsis/              # Windows NSIS installer
└── macos/             # macOS .app bundle
```

### Mobile

```
mobile/personal-finance-tracker/dist/
├── personal-finance-tracker.apk   # Android
└── personal-finance-tracker.ipa   # iOS
```

## Troubleshooting

### Build fails on Linux
```bash
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

### Build fails on Windows
- Install Visual Studio Build Tools
- Run: `rustup target add x86_64-pc-windows-msvc`

### Build fails on macOS
```bash
xcode-select --install
```

### Build fails on Android/iOS
```bash
npm install -g eas-cli
npx eas init
```

## Next Steps

- Read [BUILD_AND_RELEASE.md](BUILD_AND_RELEASE.md) for detailed instructions
- Read [CROSS_PLATFORM_BUILDS.md](CROSS_PLATFORM_BUILDS.md) for workflow details
- Check [README.md](README.md) for app features

## Support

- GitHub Issues: Report bugs or request features
- Discussions: Ask questions and share ideas
- Wiki: Community-contributed guides

---

**Happy building! 🚀**
