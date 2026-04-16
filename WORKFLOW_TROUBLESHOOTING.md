# GitHub Actions Workflow Troubleshooting

This guide helps resolve common issues with the continuous build and release workflows.

## Common Issues & Solutions

### Error: "Dependencies lock file is not found"

**Error Message:**
```
Error: Dependencies lock file is not found in /home/runner/work/...
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**Cause:** The workflow is configured to use `npm` cache, but the project uses `pnpm` with `pnpm-lock.yaml`.

**Solution:**

Update the `Setup Node.js` step in your workflow:

```yaml
# ❌ WRONG - Looking for npm lock file
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'  # ← This causes the error

# ✅ CORRECT - Use pnpm cache
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'

- name: Setup pnpm cache
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'pnpm'  # ← Correctly looks for pnpm-lock.yaml
```

**Or use a single step:**

```yaml
- name: Setup Node.js with pnpm cache
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'pnpm'
```

### Why This Happens

The `cache` parameter tells GitHub Actions which lock file to look for:

| Package Manager | Lock File | Cache Value |
|---|---|---|
| npm | `package-lock.json` | `npm` |
| Yarn | `yarn.lock` | `yarn` |
| pnpm | `pnpm-lock.yaml` | `pnpm` |

If you specify `cache: 'npm'` but your project uses pnpm, GitHub Actions will fail because it can't find `package-lock.json`.

### Affected Workflows

Check these workflow files for the issue:

- `.github/workflows/continuous-build.yml`
- `.github/workflows/build-release.yml`
- `.github/workflows/release-drafter.yml`
- Any other custom workflows

### Verification

After fixing, verify the workflow works:

1. Make a test commit
2. Push to your repository
3. Go to Actions tab
4. Check if the workflow runs successfully

## Other Common Issues

### Issue: "pnpm: command not found"

**Cause:** pnpm is not installed before running pnpm commands.

**Solution:**

Ensure pnpm is installed before using it:

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 10

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### Issue: "Rust toolchain not found"

**Cause:** Rust is not installed for desktop builds.

**Solution:**

```yaml
- name: Install Rust
  uses: dtolnay/rust-toolchain@stable
  with:
    targets: ${{ matrix.target }}
```

### Issue: "System dependencies not found" (Linux)

**Cause:** Required system packages for Tauri are missing.

**Solution:**

```yaml
- name: Install system dependencies (Linux)
  if: runner.os == 'Linux'
  run: |
    sudo apt-get update
    sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

### Issue: "Build artifacts not found"

**Cause:** Build failed or artifacts are in unexpected location.

**Solution:**

1. Check build logs for errors
2. Verify artifact paths in workflow
3. Ensure build command completes successfully

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-artifacts
    path: |
      src-tauri/target/*/release/bundle/**/*
    if-no-files-found: ignore  # ← Prevents error if no files found
```

## Debugging Workflows

### Enable Debug Logging

Add to workflow to see detailed logs:

```yaml
env:
  RUNNER_DEBUG: 1
  ACTIONS_STEP_DEBUG: true
```

### View Workflow Logs

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. Click job name
5. Expand failed step to see logs

### Test Locally

Test workflow locally using `act`:

```bash
# Install act
brew install act  # macOS
# or
sudo apt-get install act  # Linux

# Run workflow locally
act push -j build-desktop
```

## Workflow Structure

### Continuous Build Workflow

```
continuous-build.yml
├── version
│   └── Generate version from commit count
├── build-desktop (parallel)
│   ├── Linux
│   ├── Windows
│   ├── macOS Intel
│   └── macOS ARM64
├── build-android (parallel)
│   └── Android APK
├── build-ios (parallel)
│   └── iOS IPA
└── draft-release
    └── Create/update draft release
```

### Release Drafter Workflow

```
release-drafter.yml
├── Trigger on PR/push
├── Parse PR labels
├── Update draft release
└── Suggest version bump
```

## Best Practices

### 1. Always Commit Lock Files

```bash
# ✅ DO commit lock files
git add pnpm-lock.yaml
git commit -m "Update dependencies"

# ❌ DON'T ignore lock files
echo "pnpm-lock.yaml" >> .gitignore  # ← Don't do this!
```

### 2. Use Consistent Node Version

```yaml
# Use same version everywhere
- uses: actions/setup-node@v4
  with:
    node-version: '22'  # ← Consistent across all jobs
```

### 3. Cache Dependencies

```yaml
- name: Setup Node.js with cache
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'pnpm'  # ← Speeds up subsequent runs
```

### 4. Use Matrix for Parallel Builds

```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        target: x86_64-unknown-linux-gnu
      - os: windows-latest
        target: x86_64-pc-windows-msvc
      - os: macos-latest
        target: x86_64-apple-darwin
```

### 5. Handle Failures Gracefully

```yaml
- name: Build (may fail)
  continue-on-error: true
  run: some-command

- name: Upload if exists
  if: hashFiles('artifact.zip') != ''
  uses: actions/upload-artifact@v4
```

## Performance Optimization

### Reduce Build Time

1. **Use caching**
   ```yaml
   cache: 'pnpm'
   ```

2. **Run jobs in parallel**
   ```yaml
   strategy:
     matrix:
       os: [ubuntu-latest, windows-latest, macos-latest]
   ```

3. **Skip unnecessary steps**
   ```yaml
   if: runner.os == 'Linux'
   ```

4. **Use latest actions**
   ```yaml
   uses: actions/setup-node@v4  # ← Latest version
   ```

### Artifact Retention

```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # ← Keep artifacts for 30 days
```

## Getting Help

### Check Logs

1. Go to failed workflow run
2. Expand failed step
3. Look for error message
4. Search error online

### Common Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [actions/setup-node](https://github.com/actions/setup-node)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [Tauri GitHub Actions](https://github.com/tauri-apps/tauri-action)

### Report Issues

If you find a bug:

1. Reproduce the issue
2. Check if it's a known issue
3. Create detailed bug report with:
   - Workflow file
   - Error logs
   - Steps to reproduce
   - Expected vs actual behavior

## Quick Reference

### Workflow File Locations

```
.github/
├── workflows/
│   ├── continuous-build.yml      # Builds on every commit
│   ├── build-release.yml         # Builds on tag push
│   ├── release-drafter.yml       # Updates draft release
│   └── webpack.yml               # Custom workflows
└── release-drafter.yml           # Release drafter config
```

### Key Files

- `package.json` - Node dependencies and scripts
- `pnpm-lock.yaml` - pnpm lock file (commit this!)
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri configuration

### Useful Commands

```bash
# Test workflow locally
act push -j build-desktop

# View workflow syntax
act -l

# Validate workflow
act --dry-run

# Debug workflow
RUNNER_DEBUG=1 act push
```

---

**Need help?** Check the error message in the workflow logs and search this guide for the error text.
