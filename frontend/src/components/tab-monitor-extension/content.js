/* window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === "START_SCREEN_CAPTURE") {
        console.log("Received message in content script, sending to background...");

        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: "track_tab" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                } else if (!response) {
                    console.error("No response received from background script.");
                } else {
                    console.log("Response from background script:", response);
                }
            });
        } else {
            console.error("chrome.runtime is not available in content script.");
        }
    }
}); */
window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === "START_SCREEN_CAPTURE") {
        console.log("Received message in content script, forwarding to background...");

        // Use window.postMessage to communicate with the background script
        window.postMessage({ type: "REQUEST_SCREENSHOT" }, "*");
    }
});
