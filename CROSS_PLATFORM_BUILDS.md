# Cross-Platform Builds - Personal Finance Tracker

This document explains how the Personal Finance Tracker is built for all platforms and how to use the automated GitHub Actions workflows.

## Overview

The Personal Finance Tracker is available on:

| Platform | Format | Status |
|----------|--------|--------|
| **Linux** | AppImage, .deb | ✅ Automated |
| **Windows** | .exe, MSI | ✅ Automated |
| **macOS** | .app, DMG | ✅ Automated (Intel & ARM64) |
| **Android** | .apk | ✅ Automated |
| **iOS** | .ipa | ✅ Automated |

## Architecture

### Desktop (Tauri)

The desktop application uses **Tauri**, a lightweight framework that wraps the React web app in a native desktop shell.

**Advantages:**
- Single codebase for all desktop platforms
- Minimal binary size (~50MB)
- Full offline capability
- Native system integration

**Build Targets:**
- `x86_64-unknown-linux-gnu` - Linux (Intel)
- `x86_64-pc-windows-msvc` - Windows (Intel)
- `x86_64-apple-darwin` - macOS (Intel)
- `aarch64-apple-darwin` - macOS (Apple Silicon)

### Mobile (React Native / Expo)

Mobile apps use **React Native with Expo**, allowing code sharing with the web version.

**Advantages:**
- Native mobile experience
- Access to device storage, notifications, etc.
- Offline-first architecture
- Shared business logic with web version

**Build Targets:**
- Android APK (via EAS Build)
- iOS IPA (via EAS Build)

## GitHub Actions Workflow

### Workflow File

Location: `.github/workflows/build-release.yml`

### Trigger Events

The workflow runs automatically when:

1. **Tag Push** - Push a version tag
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. **Manual Trigger** - Via GitHub Actions UI
   - Go to Actions → Build and Release All Platforms → Run workflow

### Workflow Jobs

#### 1. Create Release
- Creates GitHub Release entry
- Generates upload URL for artifacts
- Sets release notes

#### 2. Build Desktop Apps (Parallel)

**Linux Build**
- Runs on: `ubuntu-latest`
- Outputs: AppImage, .deb
- Time: ~5-10 minutes

**Windows Build**
- Runs on: `windows-latest`
- Outputs: .exe, MSI
- Time: ~5-10 minutes

**macOS Intel Build**
- Runs on: `macos-latest`
- Target: `x86_64-apple-darwin`
- Outputs: .app, DMG
- Time: ~10-15 minutes

**macOS ARM64 Build**
- Runs on: `macos-latest`
- Target: `aarch64-apple-darwin`
- Outputs: .app, DMG (Apple Silicon)
- Time: ~10-15 minutes

#### 3. Build Mobile Apps (Parallel)

**Android Build**
- Runs on: `ubuntu-latest`
- Outputs: .apk
- Time: ~15-20 minutes

**iOS Build**
- Runs on: `macos-latest`
- Outputs: .ipa
- Time: ~20-30 minutes

### Total Build Time

- **First Release**: ~30-40 minutes (all builds in parallel)
- **Subsequent Releases**: ~25-35 minutes (caching helps)

## Release Process

### Step 1: Prepare Release

```bash
# Update version
vim package.json          # Update version
vim src-tauri/tauri.conf.json  # Update version

# Update changelog
vim CHANGELOG.md

# Commit
git add .
git commit -m "Bump version to v1.0.0"
git push origin main
```

### Step 2: Create Release Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to trigger workflow
git push origin v1.0.0
```

### Step 3: Monitor Build

1. Go to GitHub repository
2. Click "Actions" tab
3. Find "Build and Release All Platforms" workflow
4. Watch build progress

### Step 4: Download Artifacts

Once all builds complete:

1. Go to GitHub Releases
2. Find release matching version tag
3. Download desired platform artifacts

## Build Artifacts

### Linux

| File | Description |
|------|-------------|
| `personal-finance-tracker-*.AppImage` | Portable AppImage (recommended) |
| `personal-finance-tracker_*.deb` | Debian package |

**Installation:**
```bash
# AppImage
chmod +x personal-finance-tracker-*.AppImage
./personal-finance-tracker-*.AppImage

# Debian
sudo dpkg -i personal-finance-tracker_*.deb
personal-finance-tracker
```

### Windows

| File | Description |
|------|-------------|
| `personal-finance-tracker-windows-x64.exe` | Portable executable |
| `personal-finance-tracker_*.msi` | Windows installer |

**Installation:**
- Double-click `.exe` to run
- Or run `.msi` for system installation

### macOS

| File | Description |
|------|-------------|
| `personal-finance-tracker-macos-intel.dmg` | Intel Mac installer |
| `personal-finance-tracker-macos-arm64.dmg` | Apple Silicon installer |

**Installation:**
1. Open `.dmg` file
2. Drag app to Applications folder
3. Run from Applications

### Android

| File | Description |
|------|-------------|
| `personal-finance-tracker-android.apk` | Android app package |

**Installation:**
1. Enable "Unknown Sources" in Settings
2. Open APK file
3. Tap "Install"

Or use ADB:
```bash
adb install personal-finance-tracker-android.apk
```

### iOS

| File | Description |
|------|-------------|
| `personal-finance-tracker-ios.ipa` | iOS app package |

**Installation:**
- Use Xcode: `xcode-select -p && open personal-finance-tracker-ios.ipa`
- Or use TestFlight for beta distribution

## Customization

### Change App Name

1. Update `package.json`:
   ```json
   {
     "name": "my-finance-tracker"
   }
   ```

2. Update `src-tauri/tauri.conf.json`:
   ```json
   {
     "productName": "My Finance Tracker",
     "identifier": "com.mycompany.financetracker"
   }
   ```

3. Update `src-tauri/Cargo.toml`:
   ```toml
   [package]
   name = "my-finance-tracker"
   ```

### Change App Icon

1. Replace icons in `src-tauri/icons/`
2. Supported formats: PNG, ICO, ICNS

### Change Bundle Settings

Edit `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "active": true,
    "targets": ["deb", "appimage"],  // Linux
    "icon": ["icons/32x32.png", "icons/icon.icns", "icons/icon.ico"]
  }
}
```

## Troubleshooting

### Workflow Fails to Start

**Issue**: Workflow doesn't trigger when pushing tag

**Solution**:
1. Verify tag format: `v*.*.*` (e.g., `v1.0.0`)
2. Check workflow file syntax: `.github/workflows/build-release.yml`
3. Ensure GitHub Actions is enabled in repository settings

### Build Fails on Specific Platform

**Issue**: One platform build fails while others succeed

**Solution**:
1. Check workflow logs for specific error
2. Run local build on that platform
3. Fix issue and retry

### Artifacts Not Uploaded

**Issue**: Build succeeds but artifacts not in release

**Solution**:
1. Check workflow logs for upload errors
2. Verify GitHub token has proper permissions
3. Check artifact paths in workflow

### Code Signing Issues

**Issue**: macOS or iOS builds fail with signing errors

**Solution**:
1. For development: Disable code signing
2. For distribution: Add signing certificates to GitHub Secrets
3. See `BUILD_AND_RELEASE.md` for signing setup

## Performance Optimization

### Caching

The workflow uses:
- **Rust cache**: `Swatinem/rust-cache@v2`
- **npm cache**: `actions/setup-node@v4` with `cache: 'npm'`

First build: ~40 minutes
Subsequent builds: ~25 minutes (with cache)

### Parallel Builds

All platform builds run in parallel:
- Desktop builds: 4 jobs
- Mobile builds: 2 jobs
- Total: 6 concurrent jobs

This reduces total time from ~3 hours to ~30 minutes.

## Security Considerations

### Secrets Management

For production releases, add to GitHub Secrets:

```bash
# macOS code signing
APPLE_ID=your-apple-id@example.com
APPLE_PASSWORD=your-app-specific-password
APPLE_TEAM_ID=ABCDEF1234

# Android signing
ANDROID_KEYSTORE_BASE64=<base64-encoded-keystore>
ANDROID_KEYSTORE_PASSWORD=your-keystore-password
ANDROID_KEY_ALIAS=your-key-alias
ANDROID_KEY_PASSWORD=your-key-password

# Windows signing
WINDOWS_CERTIFICATE_BASE64=<base64-encoded-certificate>
WINDOWS_CERTIFICATE_PASSWORD=your-cert-password
```

### Workflow Security

- Workflow uses read-only GitHub token by default
- Artifacts uploaded to GitHub Release (not external storage)
- No secrets exposed in logs
- Builds run in isolated GitHub Actions runners

## Future Enhancements

- [ ] Automatic version bumping
- [ ] Changelog generation from git commits
- [ ] Code signing automation
- [ ] Notarization for macOS
- [ ] Play Store / App Store distribution
- [ ] Update checker in app
- [ ] Crash reporting
- [ ] Analytics (privacy-respecting)

## Support

For issues:
1. Check workflow logs: GitHub Actions → Build and Release
2. Review `BUILD_AND_RELEASE.md` for local build help
3. Open GitHub Issue with error details

## License

MIT License - See LICENSE file
