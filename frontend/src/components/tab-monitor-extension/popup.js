document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");
    const exportBtn = document.getElementById("exportBtn");

    // Fetch visit logs from chrome storage
    chrome.storage.local.get({ visits: [] }, (data) => {
        historyList.innerHTML = "";

        // Display the visit logs in the popup
        data.visits.forEach((visit) => {
            const li = document.createElement("li");
            li.textContent = `${visit.url} - ${visit.time}`;
            historyList.appendChild(li);
        });

        // Export logs to a CSV file when the user clicks the "Export Logs" button
        exportBtn.addEventListener("click", () => {
            const logs = data.visits.map((visit) => `${visit.url},${visit.time}`).join("\n");
            const csvContent = "URL,Time\n" + logs;

            // Create a Blob and trigger the file download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "visit_logs.csv";
            link.click();
        });
    });
});
