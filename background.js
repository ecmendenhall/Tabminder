function Settings () {
    this.blocklist = [];
    this.time_limits = {};
    this.elapsed_times = {};
    this.timerbutton_elapsed_times = {};
    this.default_time_limit = 600;
    this.restore_url = "";
    this.show_badge = true;
    this.loaded = false;
}

Settings.prototype.load_settings = function () {

    function get_JSON_settings (name) {
        if (localStorage.getItem(name) === "undefined") {
            return {};
        }
        if (name in localStorage === false)
            return {};
        var stringified_settings = localStorage[name];
        var setting = JSON.parse(stringified_settings);
        return setting;
        }
    
    //console.log("load_settings()");
    
    this.time_limits = get_JSON_settings('timesink_urls');
    for (url in this.time_limits) {
        this.blocklist.push(url);
        if (this.loaded === false || url in this.elapsed_times === false)
            this.elapsed_times[url] = 0;
    }
    
    var extra_settings = get_JSON_settings('extra_settings');
    if ('show_badge' in extra_settings && 'default_time' in extra_settings) {
        this.default_time_limit = extra_settings['default_time'] * 60;
        this.show_badge = extra_settings['show_badge'];
    }

    this.loaded = true;
}

Settings.prototype.save_settings = function (name, setting) {
        var stringified_settings = JSON.stringify(setting);
        localStorage.setItem(name, stringified_settings);
}

function get_location(url) {
    var link = document.createElement("a");
    link.href = url;
    return link
}

settings = new Settings();
settings.load_settings();

// Listen for messages from other pages.
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {

        // Messages from popup
        if (request.show_settings === true) {
            var options_url = chrome.extension.getURL('options.html')
            chrome.tabs.create({url: options_url });
        }

        if (request.add_page === true) {
            //console.log("Adding page to timesinks!");
            chrome.tabs.query({active: true}, function (tab_array) {
                var tab = tab_array[0];
                var active_hostname = get_location(tab.url).hostname;
                //console.log(active_hostname);
                settings.time_limits[active_hostname] = settings.default_time_limit;
                settings.save_settings('timesink_urls', settings.time_limits);
                settings.load_settings();
                chrome.tabs.reload(tab.id);
            });
        }

        if (request.start_timer === true) {
            //console.log("Timer started!");
            chrome.tabs.query({active: true}, function (tab_array) {
                var tab = tab_array[0];
                var active_hostname = get_location(tab.url).hostname;
                settings.timerbutton_elapsed_times[active_hostname] = 0;
            });
        }
        
        // Messages from options page
        if (request.update_settings === true) {
            settings.load_settings();
        }
});

// Listen for connections from other scripts
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        
        // Connections from timeup page:
        if (msg.close_tabs === true) {
            chrome.tabs.remove(port.sender.tab.id);
        }

        if (msg.restart_timer === true) {
            //console.log("restarting timer");
            //console.log(settings.restore_url);
            var reset_hostname = get_location(settings.restore_url).hostname;
            //console.log(reset_hostname);
            settings.elapsed_times[reset_hostname] = 0;
        }
    });
});

// Listen for closed tabs
chrome.tabs.onRemoved.addListener(function(tab) {
    update_icon("off");
});

// Listen for updated tabs
chrome.tabs.onUpdated.addListener(function(tab, changeInfo) {
    if(changeInfo.status === 'complete') {
        chrome.tabs.query({active: true}, function(tab_array) {
            var tab = tab_array[0];
            var parsed_url = get_location(tab.url);
            if (settings.blocklist.indexOf(parsed_url.hostname) !== -1) {
                update_icon("on");
            } else {
                update_icon("off");
            }
        });
    }
 });

var check_interval = 10000;
var check_interval_set = false;
set_check_interval();

function set_check_interval () {
    // Check for current tab time every check_interval milliseconds.
    //console.log("set_check_interval()");
    if (check_interval_set === false) {
        check_interval_set = true;
        var checktime_interval_id = setInterval(check_times, check_interval);
    }
}
    
function check_times () {
    //console.log("check_times()");
    chrome.tabs.query({active: true}, function(tab_array) {

        var tab = tab_array[0];
        var parsed_url = get_location(tab.url);
        
        if(tab.status === 'complete' 
            && /^(https?):/.test(tab.url)
            && (settings.blocklist.indexOf(parsed_url.hostname) !== -1)) {
            update_icon("on");
            update_times(tab, parsed_url.hostname);
        } else {
            update_icon("off");
        }

    });
}

function update_icon(icon_status) {
    //console.log("update_icon()");
    chrome.browserAction.setIcon({path: "img/" + icon_status + ".png"});
    if (icon_status === "off") {
        chrome.browserAction.setBadgeText({text: ""}); }
}

function update_times (tab, hostname) {
    //console.log("update_times()");

    var time_limit = settings.time_limits[hostname];
    var time_elapsed = settings.elapsed_times[hostname];
    settings.elapsed_times[hostname] = time_elapsed + (check_interval / 1000)
    console.log("Time left: ", time_limit - time_elapsed);
    //console.log(settings.elapsed_times[response.url], settings.time_limits[response.url]);
    
    var badge_string = '';
    if (settings.show_badge === true) {
        var badge_string = Math.round((time_limit - time_elapsed)/60).toString();
        //console.log(badge_string, time_limit, time_elapsed);
    }

    chrome.browserAction.setBadgeBackgroundColor({color: [99,99,99,255]});
    chrome.browserAction.setBadgeText({text: badge_string, tabId: tab.id});

    if (time_elapsed > time_limit) {
        //console.log("Time's up!");
        settings.restore_url = tab.url;
        var timeup_url = chrome.extension.getURL('timeup.html');
        update_icon("off");
        chrome.tabs.update({url: timeup_url});
    }
}
