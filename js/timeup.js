document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("close-tabs").addEventListener('click', close_tabs);
    document.getElementById("restart-timer").addEventListener('click', restart_timer);
});

var port = chrome.extension.connect();

function close_tabs () {
    console.log("close_tabs()");
    port.postMessage({close_tabs: true});
}

function restart_timer () {
    console.log("restart_timer()");
    port.postMessage({restart_timer: true});
} 
