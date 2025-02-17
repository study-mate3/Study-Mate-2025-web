const distractingSites = ["facebook.com", "instagram.com", "youtube.com", "twitter.com"];

chrome.history.onVisited.addListener((historyItem) => {
    if (distractingSites.some(site => historyItem.url.includes(site))) {
        const visitTime = new Date().toLocaleTimeString();
        
        // Save the visit time in Chrome storage
        chrome.storage.local.get({ visits: [] }, (data) => {
            const visits = data.visits;
            visits.push({ url: historyItem.url, time: visitTime });

            chrome.storage.local.set({ visits });
        });

        // Show a warning notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Distraction Alert!",
            message: `You visited ${historyItem.url} at ${visitTime}. Stay focused!`
        });
    }
});
