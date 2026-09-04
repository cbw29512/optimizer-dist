/**
 * Web Stream Optimizer
 * Strategy: heuristic DOM cleanup plus site-specific streaming helpers.
 */

let isRunning = true;
let isObserving = false;
const AD_SCORE_THRESHOLD = 3;

const runUniversalEngine = () => {
    if (!isRunning) return;

    const currentDomain = window.location.hostname;
    const candidates = document.querySelectorAll('div, iframe, ins, aside, section, [class*="ad-"], [id*="ad-"], [class*="sponsored"]');

    candidates.forEach((el) => {
        if (el.dataset.optimized) return;

        let adScore = 0;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        if (style.position === 'fixed' || style.position === 'sticky') {
            if (parseInt(style.zIndex, 10) > 900) adScore += 2;
        }

        if (rect.width > 0 && rect.height > 0) {
            if ((Math.abs(rect.width - 300) < 5 && Math.abs(rect.height - 250) < 5) ||
                (Math.abs(rect.width - 728) < 5 && Math.abs(rect.height - 90) < 5) ||
                (Math.abs(rect.width - 160) < 5 && Math.abs(rect.height - 600) < 5)) {
                adScore += 3;
            }
        }

        const content = el.innerText ? el.innerText.toLowerCase() : "";
        if (content.length < 200 && (content.includes('sponsored') || content.includes('advertisement') || content.includes('promoted'))) {
            adScore += 2;
        }

        if (el.matches('.video-container-wrapper, .bit-media-ad, #onetrust-consent-sdk, .cookie-banner')) {
            adScore += 10;
        }

        if (adScore >= AD_SCORE_THRESHOLD) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.dataset.optimized = 'true';

            if (document.body.style.overflow === 'hidden') {
                document.body.style.setProperty('overflow', 'auto', 'important');
            }
        }
    });

    if (currentDomain.includes('youtube.com')) {
        const video = document.querySelector('video');
        const isAd = document.querySelector('.ad-showing, .ad-interrupting');
        document.querySelectorAll('.ytp-ad-skip-button-modern, .ytp-skip-ad-button').forEach((btn) => btn.click());

        if (video && isAd) {
            video.playbackRate = 16.0;
            video.muted = true;
        }
    }

    if (currentDomain.includes('amazon') || currentDomain.includes('primevideo')) {
        const skipBtn = document.querySelector('.adSkipButton, .atvwebplayersdk-skipelement-button');
        if (skipBtn) skipBtn.click();

        const adMarker = document.querySelector('.ad-marker, .fu4rd6c');
        const video = document.querySelector('video');
        if (video && adMarker) {
            video.playbackRate = 16.0;
            video.muted = true;
        }
    }
};

const observer = new MutationObserver(() => {
    try {
        runUniversalEngine();
    } catch (error) {
        console.warn('Web Stream Optimizer handled a DOM scan error.', error);
    }
});

function beginObservation() {
    if (!isRunning || isObserving || !document.body) return;
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    isObserving = true;
    runUniversalEngine();
}

function startEngine() {
    isRunning = true;
    if (document.body) beginObservation();
    else window.addEventListener('DOMContentLoaded', beginObservation, { once: true });
}

function stopEngine() {
    isRunning = false;
    if (!isObserving) return;
    observer.disconnect();
    isObserving = false;
}

chrome.storage.local.get(['enabled'], (result) => {
    if (result.enabled === false) stopEngine();
    else startEngine();
});

chrome.runtime.onMessage.addListener((message) => {
    if (message?.action !== 'toggle') return;
    if (message.enabled) startEngine();
    else stopEngine();
});
