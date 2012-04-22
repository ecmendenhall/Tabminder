document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("start-timer").addEventListener('click', start_timer);
    document.getElementById("add-page").addEventListener('click', add_page);
    document.getElementById("load-settings").addEventListener('click', load_settings);
});

function start_timer () {
 console.log("start_timer()");
 chrome.extension.sendRequest({start_timer: true});
 window.close();
}

function add_page () {
 console.log("add_page()");
 chrome.extension.sendRequest({add_page: true});
 window.close();
}

function load_settings () {
 console.log("load_settings()");
 chrome.extension.sendRequest({load_settings: true});
 window.close();
}

