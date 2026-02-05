/**
 * Web Stream Optimizer v1.8 - The Evolutionary Engine
 * Merged Features: Heuristic Learning, YouTube Accelerator, Cookie Zapper
 */

let isRunning = true;
let adStartTime = 0;
const AD_SCORE_THRESHOLD = 3; // Learning sensitivity

// 1. REPUTATION SYSTEM: Tracks how "infected" a site is
const updateDomainReputation = (domain, score) => {
    chrome.storage.local.get(['siteHistory'], (data) => {
        let history = data.siteHistory || {};
        if (!history[domain]) {
            history[domain] = { blockCount: 0, totalScore: 0, vaccineApplied: false };
        }
        history[domain].blockCount += 1;
        history[domain].totalScore += score;
        
        // If we block > 10 items, label site as "Vaccinated" (High Risk)
        if (history[domain].blockCount > 10) history[domain].vaccineApplied = true;
        
        chrome.storage.local.set({ siteHistory: history });
    });
};

const runEvolutionaryEngine = () => {
    if (!isRunning) return;

    // --- A. GENERAL WEB: Heuristic "Search & Destroy" ---
    const currentDomain = window.location.hostname;
    const candidates = document.querySelectorAll('div, ins, aside, iframe, section, [id^="div-gpt"]');

    candidates.forEach(el => {
        if (el.dataset.optimized) return; // Skip if already checked

        let adScore = 0;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        // Heuristic 1: Structure (Fixed overlays, High Z-Index)
        if (style.position === 'fixed' || style.position === 'sticky') adScore += 1;
        if (parseInt(style.zIndex) > 900) adScore += 1;

        // Heuristic 2: Standard Ad Sizes (300x250, 728x90)
        if (rect.width > 0 && rect.height > 0) {
            if ((rect.width === 300 && rect.height === 250) || 
                (rect.width === 728 && rect.height === 90)) adScore += 2;
        }

        // Heuristic 3: Keywords (Content Analysis)
        const content = el.innerText ? el.innerText.toLowerCase() : "";
        if (content.includes('sponsored') || content.includes('advertisement') || el.id.includes('google_ads')) adScore += 2;

        // Heuristic 4: Specific Targets (Cookie Banners & 5e.tools)
        if (el.matches('#onetrust-consent-sdk, .cookie-banner, .video-container-wrapper, .bit-media-ad')) adScore += 5;

        // EXECUTION
        if (adScore >= AD_SCORE_THRESHOLD) {
            el.style.display = 'none'; // Safer than remove() for layout stability
            el.dataset.optimized = 'true';
            updateDomainReputation(currentDomain, adScore);
            
            // Unlock scrolling if the ad froze the page
            if (document.body.style.overflow === 'hidden') {
                document.body.style.setProperty('overflow', 'auto', 'important');
            }
        }
    });

    // --- B. YOUTUBE: High-Intensity Accelerator ---
    const video = document.querySelector('video');
    const moviePlayer = document.querySelector('#movie_player');
    const isAd = moviePlayer?.classList.contains('ad-showing') || 
                 document.querySelector('.ad-interrupting, .ytp-ad-player-overlay');

    // 1. Skip Button Clicker
    document.querySelectorAll('.ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-overlay-close-button').forEach(btn => btn.click());

    // 2. Speed Accelerator
    if (video && isAd) {
        if (video.playbackRate < 16) {
            video.playbackRate = 16.0;
            video.muted = true;
            adStartTime = Date.now();
        }
    } else if (video && video.playbackRate > 1.0) {
        // Calculate Time Saved
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
    if (isRunning) observer.observe(document.body, { childList: true, subtree: true, attributes: true });
});