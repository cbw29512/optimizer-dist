chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });
  console.log("Web Stream Optimizer: System Initialized.");
});