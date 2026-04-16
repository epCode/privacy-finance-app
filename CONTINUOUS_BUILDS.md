# Continuous Builds & Automated Draft Releases

This document explains how the Personal Finance Tracker automatically builds on every commit and creates draft releases.

## Overview

The project uses three complementary GitHub Actions workflows:

1. **Continuous Build** (`continuous-build.yml`) - Builds on every commit
2. **Release Drafter** (`release-drafter.yml`) - Maintains draft release from PRs
3. **Manual Release** (`build-release.yml`) - Creates final release from tag

## Continuous Build Workflow

### What It Does

- **Triggers**: Every push to `main` or `develop` branch
- **Builds**: All platforms (Linux, Windows, macOS, Android, iOS)
- **Creates**: Draft release with all artifacts
- **Comments**: Adds build status to commit

### Versioning Strategy

Uses **commit-based versioning**:
```
0.0.{COMMIT_COUNT}-{SHORT_SHA}

Example: 0.0.1234-a1b2c3d
```

**Advantages:**
- Automatic versioning (no manual bumping)
- Unique per commit
- Sortable and comparable
- Easy to trace back to specific commit

### Build Process

```
1. Generate Version
   └─ Creates version from commit count + SHA

2. Build Desktop (Parallel)
   ├─ Linux (AppImage + .deb)
   ├─ Windows (.exe + MSI)
   ├─ macOS Intel (.dmg)
   └─ macOS ARM64 (.dmg)

3. Build Mobile (Parallel)
   ├─ Android (.apk)
   └─ iOS (.ipa)

4. Create Draft Release
   └─ Uploads all artifacts
   └─ Comments on commit
```

### Artifacts

All builds are kept for 30 days:

```
artifacts/
├── personal-finance-tracker-linux-x64/
│   ├── personal-finance-tracker.AppImage
│   └── personal-finance-tracker.deb
├── personal-finance-tracker-windows-x64/
│   ├── personal-finance-tracker.exe
│   └── personal-finance-tracker.msi
├── personal-finance-tracker-macos-x64/
│   └── personal-finance-tracker.dmg
├── personal-finance-tracker-macos-arm64/
│   └── personal-finance-tracker.dmg
├── personal-finance-tracker-android/
│   └── personal-finance-tracker.apk
└── personal-finance-tracker-ios/
    └── personal-finance-tracker.ipa
```

## Release Drafter Workflow

### What It Does

- **Triggers**: On PRs and pushes to main/develop
- **Maintains**: Draft release with changelog
- **Groups**: Changes by category (features, bugs, improvements, etc.)
- **Auto-versions**: Based on labels (breaking/minor/patch)

### PR Labels

Use these labels on PRs to categorize changes:

| Label | Category | Version Impact |
|-------|----------|---|
| `feature` | 🚀 Features | Minor bump |
| `enhancement` | 🚀 Features | Minor bump |
| `bug` | 🐛 Bug Fixes | Patch bump |
| `bugfix` | 🐛 Bug Fixes | Patch bump |
| `fix` | 🐛 Bug Fixes | Patch bump |
| `improvement` | 🔧 Improvements | Patch bump |
| `refactor` | 🔧 Improvements | Patch bump |
| `perf` | 🔧 Improvements | Patch bump |
| `docs` | 📚 Documentation | Patch bump |
| `security` | 🔐 Security | Patch bump |
| `dependencies` | ⚙️ Dependencies | Patch bump |
| `breaking` | Breaking Change | Major bump |

### Example PR

```markdown
# Add Budget Tracking Feature

## Description
Implements budget management with spending limits by category.

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Breaking change

## Labels
- feature
- enhancement
```

When merged, Release Drafter will:
1. Add to "🚀 Features" section
2. Create changelog entry
3. Update draft release
4. Suggest minor version bump

## Manual Release Workflow

### Creating a Release

1. **Prepare Release**
   ```bash
   # Update version in package.json and src-tauri/tauri.conf.json
   vim package.json
   vim src-tauri/tauri.conf.json
   
   # Commit
   git add .
   git commit -m "Bump version to v1.0.0"
   git push origin main
   ```

2. **Create Tag**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

3. **Workflow Runs**
   - Builds all platforms
   - Creates GitHub Release
   - Uploads all artifacts
   - Publishes release

### Release Checklist

- [ ] All PRs merged and labeled
- [ ] Changelog reviewed in draft release
- [ ] Version bumped in package.json
- [ ] Version bumped in src-tauri/tauri.conf.json
- [ ] Tag created and pushed
- [ ] GitHub Actions completes
- [ ] Release published (convert draft to release)

## Workflow Comparison

| Feature | Continuous Build | Release Drafter | Manual Release |
|---------|------------------|-----------------|---|
| **Trigger** | Every commit | PR/push | Tag push |
| **Creates Release** | Draft | Draft | Published |
| **Artifacts** | All platforms | — | All platforms |
| **Versioning** | Auto (commit-based) | Auto (semantic) | Manual |
| **Purpose** | Testing/CI | Changelog | Distribution |

## Best Practices

### Commit Messages

Use conventional commits for better changelog:

```
feat: Add budget tracking feature
fix: Resolve transaction sorting bug
docs: Update build documentation
perf: Optimize balance calculation
chore: Update dependencies
```

### PR Workflow

1. Create feature branch
   ```bash
   git checkout -b feature/budget-tracking
   ```

2. Make changes and commit
   ```bash
   git commit -m "feat: Add budget tracking"
   ```

3. Push and create PR
   ```bash
   git push origin feature/budget-tracking
   ```

4. Add labels to PR
   - `feature` for new functionality
   - `bug` for fixes
   - `docs` for documentation

5. Merge to main
   - Triggers Release Drafter update
   - Triggers continuous build

### Version Numbering

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR**: New features (e.g., 1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (e.g., 1.0.0 → 1.0.1)

**Continuous Build**: `0.0.{COMMIT_COUNT}-{SHA}`
- Used for development builds
- Not suitable for production releases

## Monitoring Builds

### GitHub Actions Dashboard

1. Go to repository
2. Click "Actions" tab
3. View workflow runs

### Workflow Status

- ✅ **Success** - All builds completed
- ⏳ **In Progress** - Builds running
- ❌ **Failed** - One or more builds failed
- ⏭️ **Skipped** - Workflow not triggered

### Artifact Downloads

1. Go to draft release
2. Download desired artifact
3. Extract and run

## Troubleshooting

### Build Fails on Specific Platform

**Check logs:**
1. Click failed job
2. View step output
3. Look for error message

**Common issues:**
- Missing system dependencies (Linux)
- Visual Studio not installed (Windows)
- Xcode not updated (macOS)
- Java/Android SDK issues

### Artifacts Not Uploaded

**Causes:**
- Build failed (check logs)
- Artifact path incorrect
- Permissions issue

**Solution:**
- Fix build error
- Retry workflow (manual trigger)
- Check artifact paths in workflow

### Draft Release Not Created

**Check:**
1. Workflow permissions (needs `contents: write`)
2. GitHub token has proper scopes
3. No conflicting releases

**Fix:**
```bash
# Manually create draft release
git tag -a build-0.0.1234-a1b2c3d -m "Build"
git push origin build-0.0.1234-a1b2c3d
```

## Advanced Configuration

### Skip Build for Certain Commits

Add `[skip ci]` to commit message:

```bash
git commit -m "Update README [skip ci]"
```

### Manual Workflow Trigger

1. Go to Actions
2. Select workflow
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow"

### Customize Versioning

Edit `.github/workflows/continuous-build.yml`:

```yaml
- name: Generate version
  id: version
  run: |
    # Customize version format here
    VERSION="custom-format"
    echo "version=${VERSION}" >> $GITHUB_OUTPUT
```

## Integration with Other Tools

### Slack Notifications

Add to workflow:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Build ${{ needs.version.outputs.version }} completed"
      }
```

### Discord Notifications

Add to workflow:

```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
```

## Performance Optimization

### Build Times

- **First build**: ~40 minutes
- **Cached build**: ~25 minutes
- **Parallel jobs**: 6 concurrent

### Caching

Workflows use:
- Rust cache (Swatinem/rust-cache)
- npm cache (actions/setup-node)
- Build artifacts (30-day retention)

### Cost Optimization

GitHub Actions free tier includes:
- 2,000 minutes/month (public repos)
- Unlimited for public repos
- 3,000 minutes/month (private repos)

**Optimization tips:**
- Use matrix strategy for parallel builds
- Cache dependencies
- Skip CI for docs-only changes
- Limit artifact retention

## Next Steps

1. **Test Workflow** - Push a commit and verify builds
2. **Add Notifications** - Integrate Slack/Discord
3. **Configure Secrets** - Add signing certificates
4. **Document Process** - Update team guidelines
5. **Monitor Costs** - Track GitHub Actions usage

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Release Drafter](https://github.com/release-drafter/release-drafter)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Happy building! 🚀**
