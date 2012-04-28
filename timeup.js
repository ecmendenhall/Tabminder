document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("close-tabs").addEventListener('click', close_tabs);
    document.getElementById("restart-timer").addEventListener('click', restart_timer);
});

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? 
                    "from a content script:" + sender.tab.url:
                    "from the extension");
    });

function close_tabs () {
    console.log("close_tabs()");
    chrome.extension.sendRequest({close_tabs: true});
}

function restart_timer () {
    console.log("restart_timer()");
    chrome.extension.sendRequest({restart_timer: true});
    history.back();
} 
