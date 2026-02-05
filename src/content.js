/**
 * Web Stream Optimizer - Zero-Loss Guardian Engine (v1.4)
 * Merged Features: Auto-Skip, 16x Speed, Time Tracker, Cookie Zapper, Real-time Toggle
 */

let isRunning = true;
let adStartTime = 0;

const runOptimizer = () => {
    if (!isRunning) return;

    // A. PRIVACY: Cookie & Cosmetic Filter (New v1.4)
    const privacyTargets = '#onetrust-consent-sdk, .cookie-banner, [id*="sp-messaging-container"], ins.adsbygoogle, .ad-slot';
    document.querySelectorAll(privacyTargets).forEach(el => {
        el.remove();
        document.body.style.overflow = 'auto'; // Unlock scroll
    });

    // B. YOUTUBE: Aggressive Skip Selectors (Kept from v1.2)
    const skipSelectors = [
        ".ytp-ad-skip-button-modern", ".ytp-skip-ad-button",
        ".ytp-ad-skip-button-slot", ".ytp-ad-skip-button",
        "button[class*='skip']", "[aria-label*='Skip ad']",
        ".ytp-ad-overlay-close-button" // Also dismisses banners
    ];

    skipSelectors.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn && btn.offsetParent !== null) {
            btn.click();
            console.log("⚡ Optimizer: Interaction Handled");
        }
    });

    // C. ENGINE: 16x Speed & Time Tracking (Kept from v1.2)
    const video = document.querySelector('video');
    const moviePlayer = document.querySelector('#movie_player');
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
        if (adStartTime > 0) {
            const saved = Math.round(((Date.now() - adStartTime) / 1000) * 15);
            chrome.storage.local.get(['totalSaved'], (res) => {
                chrome.storage.local.set({ totalSaved: (res.totalSaved || 0) + saved });
            });
            adStartTime = 0;
        }
        video.playbackRate = 1.0;
        video.muted = false;
    }
};

// D. OBSERVER & MESSAGING: Real-time Toggle (Kept from v1.1)
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