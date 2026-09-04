# Privacy Policy

Web Stream Optimizer is designed as a local browser extension.

## Data handling

The current extension code does not intentionally collect or transmit browsing history, page contents, account information, or analytics to the project owner.

The background service worker downloads the public blocklist from:

`https://raw.githubusercontent.com/cbw29512/optimizer-dist/main/master_blocklist.json`

The content script analyzes page DOM locally so it can identify and hide likely ads, overlays, sponsored elements, and selected streaming interruptions.

The enabled/disabled preference is stored in browser extension storage.

## Broad site access

The extension requests `<all_urls>` because its universal cleanup engine is intended to work across websites. That permission means the extension can inspect and modify page DOM on visited sites. Users should install only if they are comfortable with that access and should review the source before use.

## Future changes

Any future telemetry, analytics, remote page-data processing, account system, or additional remote endpoint must be disclosed here before release. Broad host access must not be repurposed for unrelated data collection.
