try {
    if (timer_loaded)
    chrome.extension.sendRequest({ loaded: timer_loaded }); }
catch(err) {
    chrome.extension.sendRequest({ loaded: false }); }
