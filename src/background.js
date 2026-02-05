const MASTER_URL = "https://raw.githubusercontent.com/cbw29512/optimizer-dist/main/master_blocklist.json";

async function refreshDynamicRules() {
    try {
        const response = await fetch(MASTER_URL);
        if (!response.ok) throw new Error("GitHub Network Error");
        
        const text = await response.text();
        // Safety: Trim whitespace to prevent JSON syntax errors
        const newRules = JSON.parse(text.trim());

        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds,
            addRules: newRules
        });
        console.log(`🛡️ Evolutionary Guardian: Updated ${newRules.length} dynamic rules.`);
    } catch (err) {
        console.error("❌ Auto-update failed (Using local fallback):", err);
    }
}

chrome.runtime.onInstalled.addListener(refreshDynamicRules);
chrome.alarms.create("dailyUpdate", { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyUpdate") refreshDynamicRules();
});