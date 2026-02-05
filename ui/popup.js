const toggleBtn = document.getElementById('toggleBtn');
const shieldIcon = document.getElementById('shieldIcon');

// Initialize UI based on current storage
chrome.storage.local.get(['enabled'], (result) => {
    // Default to true if not set
    const isEnabled = result.enabled !== false; 
    updateUI(isEnabled);
});

toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
        const currentState = result.enabled !== false;
        const newState = !currentState;

        chrome.storage.local.set({ enabled: newState }, () => {
            updateUI(newState);
            // Send message to open tabs so they stop/start immediately
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
        toggleBtn.className = "on"; // Use your green CSS class
        shieldIcon.classList.remove('inactive-shield');
    } else {
        toggleBtn.innerText = "INACTIVE";
        toggleBtn.className = "off"; // Use your red CSS class
        shieldIcon.classList.add('inactive-shield');
    }
}