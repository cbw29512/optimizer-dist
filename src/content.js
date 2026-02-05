/**
 * Web Stream Optimizer - High-Intensity Engine (v1.1)
 * Fixed for 2026 YouTube "Sponsored" UI & Real-time Toggling
 */

let isRunning = true; // Tracks the local execution state

const runOptimizer = () => {
    // 1. Exit early if the user has disabled the optimizer
    if (!isRunning) return;

    const skipSelectors = [
        ".ytp-ad-skip-button-modern",
        ".ytp-skip-ad-button",
        ".ytp-ad-skip-button-slot",
        ".ytp-ad-skip-button",
        "button[class*='skip']",
        "[aria-label*='Skip ad']"
    ];

    skipSelectors.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn && btn.offsetParent !== null) {
            btn.click();
            console.log("⚡ Optimizer: Skip Clicked!");
        }
    });

    const video = document.querySelector('video');
    const moviePlayer = document.querySelector('#movie_player');
    const isAd = moviePlayer?.classList.contains('ad-showing') || 
                 document.querySelector('.ad-interrupting, .ytp-ad-player-overlay');

    if (video && isAd) {
        video.playbackRate = 16.0; 
        video.muted = true;
        if (video.paused) video.play().catch(() => {});
    } else if (video && video.playbackRate > 2.0) {
        // Reset to normal when the ad ends or if the script is disabled
        video.playbackRate = 1.0;
        video.muted = false;
    }
};

const observer = new MutationObserver(runOptimizer);

/**
 * 2. Real-time Message Listener
 * Listens for the "toggle" message sent from popup.js
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggle") {
        isRunning = message.enabled;
        
        if (isRunning) {
            console.log("🚀 Optimizer: Activated");
            observer.observe(document.body, { 
                childList: true, 
                subtree: true, 
                attributes: true 
            });
            runOptimizer();
        } else {
            console.log("🛑 Optimizer: Deactivated");
            observer.disconnect();
            
            // Critical Fix: Reset video speed if it was mid-bypass
            const video = document.querySelector('video');
            if (video) {
                video.playbackRate = 1.0;
                video.muted = false;
            }
        }
    }
    // Return true to keep the message channel open for async responses if needed
    return true; 
});

/**
 * 3. Initial Boot Logic
 * Checks the stored state on page load to decide if it should start running.
 */
chrome.storage.local.get(['enabled'], (result) => {
    isRunning = result.enabled !== false; // Default to true if never set
    if (isRunning) {
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true 
        });
        runOptimizer();
    }
});