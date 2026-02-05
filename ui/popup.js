const toggleBtn = document.getElementById('toggleBtn');
const shieldIcon = document.getElementById('shieldIcon');
const timeDisplay = document.getElementById('timeSaved');

// Initial Load
chrome.storage.local.get(['enabled', 'totalSaved'], (result) => {
    const isEnabled = result.enabled !== false;
    updateUI(isEnabled);
    if (timeDisplay) timeDisplay.innerText = result.totalSaved || 0;
});

toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
        const newState = !(result.enabled !== false);
        chrome.storage.local.set({ enabled: newState }, () => {
            updateUI(newState);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", enabled: newState });
            });
        });
    });
});

function updateUI(isEnabled) {
    toggleBtn.innerText = isEnabled ? "ACTIVE" : "INACTIVE";
    toggleBtn.className = isEnabled ? "on" : "off";
    isEnabled ? shieldIcon.classList.remove('inactive-shield') : shieldIcon.classList.add('inactive-shield');
}