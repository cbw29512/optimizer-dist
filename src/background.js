const BLOCKLIST_URL = "https://raw.githubusercontent.com/cbw29512/optimizer-dist/main/master_blocklist.json";

// Function to fetch and update rules
async function updateBlocklist() {
  try {
    const response = await fetch(BLOCKLIST_URL);
    const newRules = await response.json();

    // Get IDs of current dynamic rules to remove them first
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);

    // Update the browser's engine
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules
    });

    console.log("🛡️ Network Blocklist Auto-Updated:", newRules.length, "rules active.");
  } catch (error) {
    console.error("❌ Blocklist Update Failed:", error);
  }
}

// Update on install and once every 24 hours
chrome.runtime.onInstalled.addListener(updateBlocklist);
chrome.alarms.create("checkUpdate", { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener(updateBlocklist);