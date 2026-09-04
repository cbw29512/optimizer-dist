const toggleBtn = document.getElementById('toggleBtn');
const shieldIcon = document.getElementById('shieldIcon');
const timeDisplay = document.getElementById('timeSaved');
const siteStatus = document.getElementById('siteStatus');
const statusMessage = document.getElementById('statusMessage');

function updateVisuals(isEnabled) {
    toggleBtn.textContent = isEnabled ? 'ACTIVE' : 'INACTIVE';
    toggleBtn.className = isEnabled ? 'on' : 'off';
    toggleBtn.setAttribute('aria-pressed', String(isEnabled));
    shieldIcon.classList.toggle('inactive-shield', !isEnabled);
}

function setStatus(message = '') {
    statusMessage.textContent = message;
}

function notifyActiveTab(enabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) return;
        chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled }, () => {
            void chrome.runtime.lastError;
        });
    });
}

chrome.storage.local.get(['enabled', 'totalSaved', 'siteHistory'], (result) => {
    const isEnabled = result.enabled !== false;
    updateVisuals(isEnabled);
    timeDisplay.textContent = String(result.totalSaved || 0);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (!url || !result.siteHistory) return;
        try {
            const domain = new URL(url).hostname;
            const history = result.siteHistory[domain];
            siteStatus.textContent = history?.vaccineApplied ? 'Health: VACCINATED' : 'Health: STABLE';
        } catch {
            siteStatus.textContent = 'Health: unavailable on this page';
        }
    });
});

toggleBtn.addEventListener('click', () => {
    toggleBtn.disabled = true;
    setStatus('Updating protection…');

    chrome.storage.local.get(['enabled'], (result) => {
        const newState = result.enabled === false;
        chrome.runtime.sendMessage({ action: 'setEnabled', enabled: newState }, (response) => {
            toggleBtn.disabled = false;
            if (chrome.runtime.lastError || !response?.ok) {
                updateVisuals(!newState);
                setStatus('Could not update protection. Try again.');
                return;
            }

            updateVisuals(response.enabled);
            notifyActiveTab(response.enabled);
            setStatus(response.enabled ? 'Protection enabled.' : 'Protection disabled.');
        });
    });
});
