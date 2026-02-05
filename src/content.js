/**
 * Web Stream Optimizer v2.0 - The Omni-Blocker
 * Strategy: Universal Heuristic Detection & Network-Level Hardening
 */

let isRunning = true;
let adStartTime = 0;
const AD_SCORE_THRESHOLD = 3;

// --- A. UNIVERSAL HEURISTIC ENGINE (Runs on ALL sites) ---
// Scans for the "DNA" of an ad: Dimensions, Z-Index, Keywords
const runUniversalEngine = () => {
    if (!isRunning) return;

    const currentDomain = window.location.hostname;

    // 1. Structural Scan: Find elements that look like ads
    // We target generic containers (div, iframe, ins) and known ad classes
    const candidates = document.querySelectorAll('div, iframe, ins, aside, section, [class*="ad-"], [id*="ad-"], [class*="sponsored"]');

    candidates.forEach((el) => {
        if (el.dataset.optimized) return;

        let adScore = 0;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        // PATTERN 1: The "Sticky Overlay" (Popups, floating videos)
        if (style.position === 'fixed' || style.position === 'sticky') {
            if (parseInt(style.zIndex) > 900) adScore += 2;
        }

        // PATTERN 2: Standard Ad Banner Sizes (IAB Standards)
        // 300x250 (Medium Rect), 728x90 (Leaderboard), 160x600 (Skyscraper)
        if (rect.width > 0 && rect.height > 0) {
            if ((Math.abs(rect.width - 300) < 5 && Math.abs(rect.height - 250) < 5) || 
                (Math.abs(rect.width - 728) < 5 && Math.abs(rect.height - 90) < 5) ||
                (Math.abs(rect.width - 160) < 5 && Math.abs(rect.height - 600) < 5)) {
                adScore += 3; // Immediate Flag
            }
        }

        // PATTERN 3: Keywords (The "Sponsored" Label)
        const content = el.innerText ? el.innerText.toLowerCase() : "";
        if (content.length < 200 && (content.includes('sponsored') || content.includes('advertisement') || content.includes('promoted'))) {
            adScore += 2;
        }

        // PATTERN 4: Known "Disease" Classes (From 5e.tools, etc.)
        if (el.matches('.video-container-wrapper, .bit-media-ad, #onetrust-consent-sdk, .cookie-banner')) {
            adScore += 10;
        }

        // NEUTRALIZE
        if (adScore >= AD_SCORE_THRESHOLD) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.dataset.optimized = 'true';
            
            // Unlock scrolling if the ad froze the page
            if (document.body.style.overflow === 'hidden') {
                document.body.style.setProperty('overflow', 'auto', 'important');
            }
        }
    });

    // --- B. SITE-SPECIFIC ACCELERATORS (Plugins) ---
    
    // 1. YouTube Plugin
    if (currentDomain.includes('youtube.com')) {
        const video = document.querySelector('video');
        const isAd = document.querySelector('.ad-showing, .ad-interrupting');
        // Auto-Click all skip buttons
        document.querySelectorAll('.ytp-ad-skip-button-modern, .ytp-skip-ad-button').forEach(btn => btn.click());
        
        if (video && isAd) {
            video.playbackRate = 16.0;
            video.muted = true;
        }
    }

    // 2. Amazon Prime Plugin
    if (currentDomain.includes('amazon') || currentDomain.includes('primevideo')) {
        const skipBtn = document.querySelector('.adSkipButton, .atvwebplayersdk-skipelement-button');
        if (skipBtn) skipBtn.click();
        
        // Amazon's "Ad Marker"
        const adMarker = document.querySelector('.ad-marker, .fu4rd6c');
        const video = document.querySelector('video');
        if (video && adMarker) {
             video.playbackRate = 16.0;
             video.muted = true;
        }
    }
};

// --- C. RUNTIME & ERROR PREVENTION ---
const observer = new MutationObserver(() => {
    try {
        runUniversalEngine();
    } catch (e) {
        // Prevent crashes from stopping the engine
        console.warn("Optimizer handled a minor DOM error");
    }
});

chrome.storage.local.get(['enabled'], (result) => {
    isRunning = result.enabled !== false;
    if (isRunning) {
        // Observe the entire body for changes (new ads loading)
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
            runUniversalEngine(); // Run once immediately
        } else {
            // Wait for body if script runs too early
            window.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { childList: true, subtree: true, attributes: true });
                runUniversalEngine();
            });
        }
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggle") isRunning = message.enabled;
});