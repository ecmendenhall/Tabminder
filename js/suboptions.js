document.addEventListener('DOMContentLoaded', function () {
    var options = chrome.extension.getURL("/html/options.html");
    document.getElementById("settings").addEventListener('click', function () { window.location = options; });
    var help = chrome.extension.getURL("/html/help.html");
    document.getElementById("help").addEventListener('click', function () { window.location = help; });
    var about = chrome.extension.getURL("/html/about.html");
    document.getElementById("about").addEventListener('click', function () { window.location = about; });
});
