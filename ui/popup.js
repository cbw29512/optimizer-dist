const toggleBtn = document.getElementById('toggleBtn');
const shieldIcon = document.getElementById('shieldIcon');
const timeSavedDisplay = document.getElementById('timeSaved'); // Add this ID to your HTML <span>

// Initialize UI based on current storage
chrome.storage.local.get(['enabled', 'totalSaved'], (result) => {
    const isEnabled = result.enabled !== false; 
    updateUI(isEnabled);
    
    // Display the saved time stats
    if (timeSavedDisplay) {
        timeSavedDisplay.innerText = result.totalSaved || 0;
    }
});

toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
        const currentState = result.enabled !== false;
        const newState = !currentState;

        chrome.storage.local.set({ enabled: newState }, () => {
            updateUI(newState);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", enabled: newState });
                }
            });
        });
    });
});

function updateUI(isEnabled) {
    if (isEnabled) {
        toggleBtn.innerText = "ACTIVE";
        toggleBtn.className = "on"; 
        shieldIcon.classList.remove('inactive-shield');
    } else {
        toggleBtn.innerText = "INACTIVE";
        toggleBtn.className = "off"; 
        shieldIcon.classList.add('inactive-shield');
    }
}