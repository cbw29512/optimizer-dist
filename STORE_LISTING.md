# Chrome Web Store submission sheet — Web Stream Optimizer 1.9.0

## Product name

Web Stream Optimizer

## Short description

Reduces disruptive ads, overlays, and streaming interruptions with local page heuristics and declarative network filtering.

## Single purpose

Web Stream Optimizer's single purpose is to reduce disruptive advertising and overlay interruptions while browsing or streaming by combining local DOM cleanup with Chrome's declarative network filtering.

It is not an analytics product, password manager, VPN, account service, or browsing-history collector.

## User-facing behavior

When ACTIVE, the extension:

- runs local page heuristics that identify likely ad/overlay containers;
- hides elements that cross the configured heuristic threshold;
- applies selected streaming-page helpers such as clicking recognized skip controls;
- uses packaged declarative network rules;
- refreshes a maintained dynamic blocklist from the project's public GitHub repository once per day.

When INACTIVE, DOM observation stops, the packaged ruleset is disabled, and dynamic rules are removed. Re-enabling restores those protection layers.

## Permission justifications

### `storage`

Stores the local enabled/disabled preference and existing local extension status data. No account is required.

### `declarativeNetRequest`

Required to apply the packaged and refreshed network filtering rules without reading or uploading response bodies.

### `alarms`

Schedules the once-daily refresh of the maintained dynamic blocklist.

### `<all_urls>`

Required by the current universal cleanup design because the content script detects disruptive overlays and ad-like elements on general web pages, not only on a fixed site list. This broad permission is reviewed by the repository release contract and is not used to upload page content or browsing history.

## Remote communication

The runtime background worker fetches one public resource:

`https://raw.githubusercontent.com/cbw29512/optimizer-dist/main/master_blocklist.json`

The fetched payload contains declarative filtering rules. The extension source does not intentionally transmit browsing history, page text, DOM contents, or user identifiers to that endpoint.

## Data handling / privacy declaration

- No user account.
- No intentional telemetry or analytics upload.
- No sale of user data.
- No intentional collection of authentication information, financial information, health information, personal communications, or precise location.
- Page DOM is inspected locally because DOM inspection is required for heuristic cleanup.
- Enabled/disabled preference is stored in Chrome extension-local storage.

See `PRIVACY.md` for the repository privacy statement.

## Reviewer notes

The repository includes permanent CI that checks:

- Manifest V3 and exact permission boundary;
- no unexpected privileged permissions;
- runtime package references;
- static/dynamic rule validity;
- remote-fetch scope;
- enable/disable behavior architecture;
- loaded-Chromium end-to-end behavior;
- generated-artifact exclusion;
- full Git-history credential patterns;
- deterministic Web Store ZIP contents.

The extension does not contain a self-hosted `update_url`; public distribution is intended for the Chrome Web Store.

## Distribution target

Public Chrome Web Store listing after developer-account setup, privacy fields, store assets, and Google review are complete. The repository build does not auto-publish to the store.
