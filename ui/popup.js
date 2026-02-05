const toggleBtn = document.getElementById('toggleBtn');
const shieldIcon = document.getElementById('shieldIcon');
const timeDisplay = document.getElementById('timeSaved');
const siteStatus = document.getElementById('siteStatus');

// Update UI on load
chrome.storage.local.get(['enabled', 'totalSaved', 'siteHistory'], (result) => {
    const isEnabled = result.enabled !== false;
    updateVisuals(isEnabled);
    
    if (timeDisplay) {
        timeDisplay.innerText = result.totalSaved || 0;
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && result.siteHistory) {
            try {
                const domain = new URL(tabs[0].url).hostname;
                const history = result.siteHistory[domain];
                if (siteStatus) {
                    siteStatus.innerText = (history && history.vaccineApplied) ? "Health: VACCINATED" : "Health: STABLE";
                }
            } catch (e) {
                console.log("Not a valid domain");
            }
        }
    });
});

toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
        const newState = !(result.enabled !== false);
        chrome.storage.local.set({ enabled: newState }, () => {
            updateVisuals(newState);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", enabled: newState });
                }
            });
        });
    });
});

function updateVisuals(isEnabled) {
    if (toggleBtn) {
        toggleBtn.innerText = isEnabled ? "ACTIVE" : "INACTIVE";
        toggleBtn.className = isEnabled ? "on" : "off";
    }
    if (shieldIcon) {
        isEnabled ? shieldIcon.classList.remove('inactive-shield') : shieldIcon.classList.add('inactive-shield');
    }
}