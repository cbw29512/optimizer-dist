# Web Stream Optimizer

Web Stream Optimizer is a Manifest V3 browser extension that uses local DOM heuristics, declarative network rules, and a maintained blocklist to reduce ads, overlays, and interruptions on streaming and general web pages.

## What it does

- Runs a local content script on matching pages
- Detects likely ad/overlay elements using dimensions, positioning, labels, and known selectors
- Applies site-specific skip/acceleration behavior for selected streaming sites
- Uses Chrome's `declarativeNetRequest` API for network-level blocking
- Refreshes its dynamic blocklist daily from this repository
- Stores the extension enabled/disabled setting locally

## Privacy

The extension does not need an account and is designed to operate locally in the browser. The current background worker fetches only the project's public `master_blocklist.json` from GitHub. The extension code does not intentionally upload browsing history, page contents, or telemetry.

Because the extension runs a content script on `<all_urls>`, it can inspect and modify page DOM in order to hide detected ads and overlays. Review `PRIVACY.md` before installing.

## Permissions

- `storage` — saves the enabled/disabled preference locally
- `declarativeNetRequest` — applies network filtering rules
- `alarms` — schedules daily blocklist refreshes
- `<all_urls>` — required for the universal page-cleanup content script

Broad host access is powerful. The extension should remain transparent about why it is required and should not add remote telemetry or unrelated page-data collection.

## Current status

**Public beta / active hardening.** The extension is functional, but it should not be treated as release-certified until automated tests, permission regression checks, packaging validation, and browser-store documentation are in place.

## Release checklist

- Validate Manifest V3 packaging
- Test enable/disable behavior
- Test blocklist fallback when GitHub is unavailable
- Test representative streaming and normal websites
- Verify no browsing-data telemetry is introduced
- Review `<all_urls>` necessity on every release
- Add automated lint/tests and CI
- Document installation and removal
- Publish a versioned changelog

## Support

If Web Stream Optimizer is useful to you, you can support continued development here:

**Buy Me a Coffee:** https://buymeacoffee.com/divclass016
