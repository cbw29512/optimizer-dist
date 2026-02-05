/**
 * Web Stream Optimizer v1.7 - The Autonomist
 * Self-Contained Learning & Heuristic Engine
 */

let isRunning = true;
const AD_SCORE_THRESHOLD = 3; // Confidence level to trigger a block

const autonomousCure = () => {
    if (!isRunning) return;

    // 1. Structural Scoring Logic
    const candidates = document.querySelectorAll('div, ins, aside, section');
    
    candidates.forEach(el => {
        if (el.dataset.optimized) return;
        
        let adScore = 0;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        // HEURISTIC A: Known Ad Dimensions (Banner/Sidebar/Popup)
        const isCommonSize = (rect.width === 300 && rect.height === 250) || 
                             (rect.width === 728 && rect.height === 90);
        if (isCommonSize) adScore += 2;

        // HEURISTIC B: Obstructive Behavior (High Z-Index/Fixed Position)
        if (style.position === 'fixed' || style.position === 'sticky') adScore += 1;
        if (parseInt(style.zIndex) > 500) adScore += 1;

        // HEURISTIC C: Keyword Density
        const content = el.innerText.toLowerCase();
        if (content.includes('sponsored') || content.includes('advertisement')) adScore += 2;

        // THE CURE: If score is high enough, neutralize and "remember"
        if (adScore >= AD_SCORE_THRESHOLD) {
            el.style.display = 'none';
            el.dataset.optimized = 'true';
            console.log(`🛡️ Autonomist: Neutralized element with score ${adScore}`);
            
            // Self-Learning: Store the fingerprint (class/ID) to speed up next load
            if (el.className) {
                saveToLocalLearner(el.className.split(' ')[0]);
            }
        }
    });
};

// Local Reputation Database
const saveToLocalLearner = (className) => {
    chrome.storage.local.get(['knownAds'], (data) => {
        const ads = data.knownAds || [];
        if (!ads.includes(className)) {
            ads.push(className);
            chrome.storage.local.set({ knownAds: ads });
        }
    });
};

const observer = new MutationObserver(autonomousCure);
// ... [Existing Setup Code] ...