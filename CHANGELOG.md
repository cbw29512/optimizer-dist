# Changelog

## 1.9.0 — 2026-09-04

### Fixed

- **INACTIVE now disables all protection layers**, not only DOM cleanup.
- Re-enabling starts the content observer without requiring a page reload.
- The background worker is now the single controller for the locally stored enabled flag.
- Remote blocklist refresh failure now reports its real behavior and keeps existing protections instead of claiming a nonexistent local dynamic fallback.
- Removed the stale self-hosted update descriptor that advertised version 1.2 while the extension was already 1.8 and referenced a nonexistent `.crx` artifact.
- Removed Chrome-generated indexed-ruleset metadata and the obsolete placeholder README.
- Removed the stale source comment that claimed v2.0 while the manifest was v1.8.

### Added

- Accessible popup title, pressed state, and live status feedback.
- Manifest/package/permission release contract in CI.
- Full Git-history credential scan.
- Blocklist shape and unique-rule-ID validation.
- Regression guards for toggle routing, remote-fetch scope, fallback behavior, and version consistency.
- Loaded-Chromium integration that verifies the real service worker, popup, DNR state, content observer, disable behavior, and re-enable behavior.
- Deterministic Chrome Web Store ZIP builder and package allowlist certification.
- Explicit development installation and removal instructions.

## 1.8

- Existing public beta baseline before the current release-hardening tranche.
