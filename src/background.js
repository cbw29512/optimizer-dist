const MASTER_URL = "https://raw.githubusercontent.com/cbw29512/optimizer-dist/main/master_blocklist.json";
const STATIC_RULESET_ID = "ruleset_1";
const DAILY_UPDATE_MINUTES = 1440;

function getEnabled() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['enabled'], (result) => resolve(result.enabled !== false));
    });
}

function storeEnabled(enabled) {
    return new Promise((resolve) => chrome.storage.local.set({ enabled }, resolve));
}

async function setStaticRulesEnabled(enabled) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled ? [STATIC_RULESET_ID] : [],
        disableRulesetIds: enabled ? [] : [STATIC_RULESET_ID]
    });
}

async function clearDynamicRules() {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule) => rule.id);
    if (!oldRuleIds.length) return;
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldRuleIds });
}

async function refreshDynamicRules() {
    if (!(await getEnabled())) return;

    try {
        const response = await fetch(MASTER_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Blocklist request failed: ${response.status}`);

        const newRules = JSON.parse((await response.text()).trim());
        if (!Array.isArray(newRules)) throw new Error('Blocklist payload must be an array');

        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map((rule) => rule.id);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds,
            addRules: newRules
        });
        console.log(`Web Stream Optimizer updated ${newRules.length} dynamic rules.`);
    } catch (error) {
        console.warn('Blocklist refresh failed; keeping packaged static rules and existing dynamic rules.', error);
    }
}

async function setEnabledState(enabled) {
    await storeEnabled(enabled);
    await setStaticRulesEnabled(enabled);
    if (enabled) await refreshDynamicRules();
    else await clearDynamicRules();
    return enabled;
}

chrome.runtime.onInstalled.addListener(async () => {
    const enabled = await getEnabled();
    await setEnabledState(enabled);
});

chrome.runtime.onStartup.addListener(async () => {
    const enabled = await getEnabled();
    await setStaticRulesEnabled(enabled);
    if (!enabled) await clearDynamicRules();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action !== 'setEnabled') return undefined;
    setEnabledState(Boolean(message.enabled))
        .then((enabled) => sendResponse({ ok: true, enabled }))
        .catch((error) => {
            console.error('Failed to update extension state.', error);
            sendResponse({ ok: false });
        });
    return true;
});

chrome.alarms.create('dailyUpdate', { periodInMinutes: DAILY_UPDATE_MINUTES });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyUpdate') refreshDynamicRules();
});
