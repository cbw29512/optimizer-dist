/**
 * Web Stream Optimizer v1.5 - The Universal Guardian
 * Focus: Pattern-based blocking for all web pages.
 */

const runUniversalCure = () => {
    if (!isRunning) return;

    // 1. Structural Pattern Matching
    // Targets common ad-server naming conventions (e.g., div-gpt-ad, ad-wrapper, banner-ads)
    const adPatterns = [
        '[id^="div-gpt-ad"]', '[class*="ad-unit"]', '[id*="google_ads"]',
        'ins.adsbygoogle', 'aside[class*="ad-"]', '.video-container-wrapper',
        '[class*="sponsored-content"]', '.cookie-banner', '#onetrust-consent-sdk'
    ];

    document.querySelectorAll(adPatterns.join(', ')).forEach(el => {
        el.remove();
        console.log("🛡️ Universal Guardian: Element Neutralized");
    });

    // 2. Scroll-Lock Break
    // Many "disease" sites lock the scroll when an ad or consent wall is present
    if (document.body.style.overflow === 'hidden') {
        document.body.style.setProperty('overflow', 'auto', 'important');
        document.documentElement.style.setProperty('overflow', 'auto', 'important');
    }

    // 3. YouTube/Video Engine (Specific High-Intensity Logic)
    const video = document.querySelector('video');
    const isAd = document.querySelector('#movie_player')?.classList.contains('ad-showing') || 
                 document.querySelector('.ad-interrupting, .ytp-ad-player-overlay');
    
    if (video && isAd) {
        video.playbackRate = 16.0;
        video.muted = true;
    }
};

const observer = new MutationObserver(runUniversalCure);
// ... [Existing Message Listener & Initialization] ...

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