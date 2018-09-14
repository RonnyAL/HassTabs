window.addEventListener('load', function load() {

    chrome.storage.sync.get(['hassUrl', 'hassPass'], function(result) {
        if (result !== undefined) {
            if (result.hassUrl !== undefined) {
                document.getElementById('hassUrl').value = result.hassUrl;
            }
            if (result.hassPass !== undefined) {
                document.getElementById('hassPass').value = result.hassPass;
            }
        }
    });


    document.getElementById('saveSettings').onclick = function() {
        chrome.storage.sync.set({hassUrl: document.getElementById('hassUrl').value});
        chrome.storage.sync.set({hassPass: document.getElementById('hassPass').value});
        console.log("Settings saved!");
    };
});