// message handlers for injecting array of CSS files
(function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // only run on https:// or http:// pages
        if (!sender.tab.url.startsWith('http://') && !sender.tab.url.startsWith('https://')) {
            return;
        }

        if (request.action === 'injectCSS' && request.cssFiles && request.cssFiles.length > 0) {
            debugger;
            chrome.scripting.insertCSS({
                target: { tabId: sender.tab.id },
                files: request.cssFiles
            });
        } else if (request.action === 'removeCSS' && request.cssFiles && request.cssFiles.length > 0) {
            chrome.scripting.removeCSS({
                target: { tabId: sender.tab.id },
                files: request.cssFiles
            });
        }
    });
})();
