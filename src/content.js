/**
 * Web Stream Optimizer v1.3 - The Guardian Update
 * Full Code Review: Feb 2026
 */

let isRunning = true;
let adStartTime = 0;

const CONFIG = {
    youtube: {
        skipSelectors: [
            ".ytp-ad-skip-button-modern", ".ytp-skip-ad-button",
            ".ytp-ad-skip-button-slot", ".ytp-ad-skip-button",
            "button[class*='skip']", "[aria-label*='Skip ad']"
        ],
        overlaySelectors: ['.ytp-ad-overlay-close-button', '.ytp-ad-image-overlay'],
        playerSelector: '#movie_player'
    },
    privacy: {
        // Targets 2026-era Cookie Banners and Consent Walls
        cookieSelectors: [
            '#onetrust-consent-sdk', '.cookie-banner', '[id*="sp-messaging-container"]',
            '[class*="consent-wall"]', '[id*="cookie-notice"]'
        ],
        // Removes empty ad slots from non-YouTube sites
        cosmeticSelectors: ['ins.adsbygoogle', '.ad-slot', '[id*="google_ads_iframe"]', 'aside[class*="ad-"]']
    }
};

const runOptimizer = () => {
    if (!isRunning) return;

    const isYouTube = window.location.hostname.includes('youtube.com');

    // 1. BRAVE-STYLE COSMETIC & COOKIE FILTERING
    CONFIG.privacy.cookieSelectors.forEach(selector => {
        const banner = document.querySelector(selector);
        if (banner) {
            banner.remove();
            // Unlock page scrolling often disabled by cookie walls
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
    });

    CONFIG.privacy.cosmeticSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 2. YOUTUBE ENGINE
    if (isYouTube) {
        // Dismiss Overlays
        CONFIG.youtube.overlaySelectors.forEach(selector => {
            const ov = document.querySelector(selector);
            if (ov && ov.offsetParent !== null) ov.click();
        });

        // Click Skip Buttons
        CONFIG.youtube.skipSelectors.forEach(selector => {
            const btn = document.querySelector(selector);
            if (btn && btn.offsetParent !== null) btn.click();
        });

        const video = document.querySelector('video');
        const moviePlayer = document.querySelector(CONFIG.youtube.playerSelector);
        const isAd = moviePlayer?.classList.contains('ad-showing') || 
                     document.querySelector('.ad-interrupting, .ytp-ad-player-overlay');

        if (video && isAd) {
            if (video.playbackRate < 16) {
                video.playbackRate = 16.0;
                video.muted = true;
                adStartTime = Date.now();
                if (video.paused) video.play().catch(() => {});
            }
        } else if (video && video.playbackRate > 1.0) {
            // Calculate Time Saved
            if (adStartTime > 0) {
                const elapsed = (Date.now() - adStartTime) / 1000;
                const saved = Math.round(elapsed * 15);
                if (saved > 0) {
                    chrome.storage.local.get(['totalSaved'], (res) => {
                        chrome.storage.local.set({ totalSaved: (res.totalSaved || 0) + saved });
                    });
                }
                adStartTime = 0; // Reset
            }
            video.playbackRate = 1.0;
            video.muted = false;
        }
    }
};

// --- CORE ARCHITECTURE ---
const observer = new MutationObserver(runOptimizer);

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggle") {
        isRunning = message.enabled;
        if (isRunning) {
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
            runOptimizer();
        } else {
            observer.disconnect();
            const video = document.querySelector('video');
            if (video) { video.playbackRate = 1.0; video.muted = false; }
        }
    }
    return true; 
});

chrome.storage.local.get(['enabled'], (result) => {
    isRunning = result.enabled !== false;
    if (isRunning) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        runOptimizer();
    }
});