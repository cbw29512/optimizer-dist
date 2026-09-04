# Web Stream Optimizer

Web Stream Optimizer is a Manifest V3 browser extension that uses local DOM heuristics, declarative network rules, and a maintained blocklist to reduce ads, overlays, and interruptions on streaming and general web pages.

## What it does

- Runs a local content script on matching pages
- Detects likely ad/overlay elements using dimensions, positioning, labels, and known selectors
- Applies site-specific skip/acceleration behavior for selected streaming sites
- Uses Chrome's `declarativeNetRequest` API for network-level blocking
- Refreshes its dynamic blocklist daily from this repository
- Stores the extension enabled/disabled setting locally
- Treats **INACTIVE** as a full extension pause: DOM scanning stops, packaged network rules are disabled, and dynamic rules are cleared
- Restores all protection layers when re-enabled without requiring a page reload for the content observer

## Privacy

The extension does not need an account and is designed to operate locally in the browser. The current background worker fetches only the project's public `master_blocklist.json` from GitHub. The extension code does not intentionally upload browsing history, page contents, or telemetry.

Because the extension runs a content script on `<all_urls>`, it can inspect and modify page DOM in order to hide detected ads and overlays. Review `PRIVACY.md` before installing.

## Permissions

- `storage` — saves the enabled/disabled preference locally
- `declarativeNetRequest` — applies network filtering rules
- `alarms` — schedules daily blocklist refreshes
- `<all_urls>` — required by the current universal page-cleanup design

Broad host access is powerful. The release contract fails if unrelated high-risk permissions such as `history`, `cookies`, `webRequest`, `scripting`, `management`, or `tabs` are added without deliberately changing the test and documentation boundary.

## Blocklist failure behavior

The packaged `rules.json` provides the built-in static network rules. When enabled, the background worker also refreshes `master_blocklist.json` from this repository.

If GitHub is unavailable or the remote payload is invalid, the extension does **not** replace working dynamic rules with an empty list. It keeps the packaged static rules and any previously installed dynamic rules. A first install with no successful remote refresh therefore has the packaged static rules only.

## Install for development/testing

1. Download or clone this repository.
2. Open `chrome://extensions` in a Chromium-based browser.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository directory containing `manifest.json`.
6. Open the extension popup and verify the toggle reports **ACTIVE**.

This repository no longer advertises a broken self-hosted `.crx` update path. Store/self-hosted release packaging should be added only when a real versioned distribution process exists.

## Remove

Open `chrome://extensions`, find **Web Stream Optimizer**, and choose **Remove**. Chrome removes the extension and its extension-local storage. Reload any already-open pages if you want to immediately restore page elements the extension had hidden before removal.

## Current status

**Public beta / release hardening.** Core permission, package, enable/disable, blocklist-fallback, and generated-artifact checks are now automated. Representative real-site behavior still needs controlled browser regression coverage before calling the extension store-ready.

## Automated release contract

CI currently verifies:

- Manifest V3 format and exact expected permissions
- deliberate `<all_urls>` boundary with no unexpected privileged permissions
- all manifest-referenced package files exist
- static and dynamic blocklists are valid arrays with unique positive IDs
- popup toggle routes through the background state controller
- disabling stops content observation, disables the packaged ruleset, and clears dynamic rules
- enabling restores network rules and the content observer
- the only runtime remote URL is this repository's `master_blocklist.json`
- remote refresh failure keeps existing protections rather than silently wiping them
- source files do not claim a version that conflicts with the manifest
- Chrome-generated `_metadata`, stale `update.xml`, and placeholder `README.txt` are not tracked

## Remaining release checklist

- Add representative-site browser regression fixtures for heuristic DOM behavior
- Exercise the extension as a loaded Chromium extension, not only static contracts
- Review `<all_urls>` necessity on every release
- Decide on Chrome Web Store vs deliberate self-hosted distribution before adding any update metadata
- Version and certify the first release candidate

## Support

If Web Stream Optimizer is useful to you, you can support continued development here:

**Buy Me a Coffee:** https://buymeacoffee.com/divclass016
