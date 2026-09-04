# Changelog

## Unreleased

### Fixed

- **INACTIVE now disables all protection layers**, not only DOM cleanup.
- Re-enabling starts the content observer without requiring a page reload.
- Password-like state is not involved; the background worker is now the single controller for the locally stored enabled flag.
- Remote blocklist refresh failure now reports its real behavior and keeps existing protections instead of claiming a nonexistent local dynamic fallback.
- Removed the stale self-hosted update descriptor that advertised version 1.2 while the manifest is 1.8 and referenced a nonexistent `.crx` artifact.
- Removed Chrome-generated indexed-ruleset metadata and the obsolete placeholder README.
- Removed the stale source comment that claimed v2.0 while the manifest is v1.8.

### Added

- Accessible popup title, pressed state, and live status feedback.
- Manifest/package/permission release contract in CI.
- Blocklist shape and unique-rule-ID validation.
- Regression guards for toggle routing, remote-fetch scope, fallback behavior, and version consistency.
- Explicit development installation and removal instructions.

## 1.8

- Existing public beta baseline before the current release-hardening tranche.
