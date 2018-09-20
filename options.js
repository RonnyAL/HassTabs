window.addEventListener('load', function load() {

    chrome.storage.sync.get(['hassUrl', 'hassPass', 'hassAccessToken'], function(result) {
        if (result !== undefined) {
            if (result.hassUrl !== undefined) {
                document.getElementById('hassUrl').value = result.hassUrl;
            }
            if (result.hassPass !== undefined) {
                document.getElementById('hassPass').value = result.hassPass;
            }
            if (result.hassAccessToken !== undefined) {
                document.getElementById('hassAccessToken').value = result.hassAccessToken;
            }
        }
    });


    document.getElementById('saveSettings').onclick = function() {
        chrome.storage.sync.set({hassUrl: document.getElementById('hassUrl').value});
        chrome.storage.sync.set({hassPass: document.getElementById('hassPass').value});
        chrome.storage.sync.set({hassAccessToken: document.getElementById('hassAccessToken').value});
        console.log("Settings saved!");
    };
});