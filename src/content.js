/**
 * Web Stream Optimizer v1.8.1 - Syntax Fix
 * Evolutionary Engine & YouTube Accelerator
 */

let isRunning = true;
let adStartTime = 0;
const AD_SCORE_THRESHOLD = 3;

// 1. REPUTATION SYSTEM
const updateDomainReputation = (domain, score) => {
    chrome.storage.local.get(['siteHistory'], (data) => {
        let history = data.siteHistory || {};
        if (!history[domain]) {
            history[domain] = { blockCount: 0, totalScore: 0, vaccineApplied: false };
        }
        history[domain].blockCount += 1;
        history[domain].totalScore += score;
        
        if (history[domain].blockCount > 10) {
            history[domain].vaccineApplied = true;
        }
        
        chrome.storage.local.set({ siteHistory: history });
    });
};

const runEvolutionaryEngine = () => {
    if (!isRunning) return;

    // --- A. GENERAL WEB ENGINE ---
    const currentDomain = window.location.hostname;
    const candidates = document.querySelectorAll('div, ins, aside, iframe, section, [id^="div-gpt"]');

    candidates.forEach((el) => {
        if (el.dataset.optimized) return;

        let adScore = 0;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        // Heuristics
        if (style.position === 'fixed' || style.position === 'sticky') adScore += 1;
        if (parseInt(style.zIndex) > 900) adScore += 1;
        
        if (rect.width > 0 && rect.height > 0) {
            if ((rect.width === 300 && rect.height === 250) || 
                (rect.width === 728 && rect.height === 90)) {
                adScore += 2;
            }
        }

        const content = el.innerText ? el.innerText.toLowerCase() : "";
        if (content.includes('sponsored') || content.includes('advertisement')) adScore += 2;

        if (el.matches && el.matches('#onetrust-consent-sdk, .cookie-banner, .video-container-wrapper')) adScore += 5;

        // EXECUTION
        if (adScore >= AD_SCORE_THRESHOLD) {
            el.style.display = 'none';
            el.dataset.optimized = 'true';
            updateDomainReputation(currentDomain, adScore);
            
            if (document.body.style.overflow === 'hidden') {
                document.body.style.setProperty('overflow', 'auto', 'important');
            }
        }
    });

    // --- B. YOUTUBE ENGINE ---
    const video = document.querySelector('video');
    const moviePlayer = document.querySelector('#movie_player');
    const isAd = moviePlayer?.classList.contains('ad-showing') || 
                 document.querySelector('.ad-interrupting, .ytp-ad-player-overlay');

    const skipBtns = document.querySelectorAll('.ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-overlay-close-button');
    skipBtns.forEach((btn) => btn.click());

    if (video && isAd) {
        if (video.playbackRate < 16) {
            video.playbackRate = 16.0;
            video.muted = true;
            adStartTime = Date.now();
        }
    } else if (video && video.playbackRate > 1.0) {
        if (adStartTime > 0) {
            const elapsed = (Date.now() - adStartTime) / 1000;
            const saved = Math.round(elapsed * 15);
            chrome.storage.local.get(['totalSaved'], (res) => {
                chrome.storage.local.set({ totalSaved: (res.totalSaved || 0) + saved });
            });
            adStartTime = 0;
        }
        video.playbackRate = 1.0;
        video.muted = false;
    }
};

// --- C. OBSERVER & MESSAGING ---
const observer = new MutationObserver(runEvolutionaryEngine);

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggle") {
        isRunning = message.enabled;
        if (isRunning) {
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
            runEvolutionaryEngine();
        } else {
            observer.disconnect();
            const video = document.querySelector('video');
            if (video) { video.playbackRate = 1.0; video.muted = false; }
        }
    }
});

chrome.storage.local.get(['enabled'], (result) => {
    isRunning = result.enabled !== false;
    if (isRunning) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
});