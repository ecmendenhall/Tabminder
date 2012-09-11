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
    
    console.log("load_settings()");
    
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
         /* console.log(sender.tab ? 
                    "from a content script:" + sender.tab.url:
                    "from the extension"); */

        // Messages from content script:        
        if (request.toggle_icon === "on") {
            update_icon("on");
        }
    
        if (request.toggle_icon === "off") {
            update_icon("off");
        }
        
        // Messages from popup
        if (request.show_settings === true) {
            var options_url = chrome.extension.getURL('options.html')
            chrome.tabs.create({url: options_url });
        }

        if (request.add_page === true) {
            //console.log("Adding page to timesinks!");
            chrome.windows.getCurrent(function(win) {
                chrome.tabs.getSelected(win.id, function (response){
                    var active_hostname = get_location(response.url).hostname;
                    settings.time_limits[active_hostname] = settings.default_time_limit;
                    settings.save_settings('timesink_urls', settings.time_limits);
                    settings.load_settings();
                    chrome.tabs.reload(response.id);
                });
            });
        }

        if (request.start_timer === true) {
            //console.log("Timer started!");
            chrome.windows.getCurrent(function(win) {
                chrome.tabs.getSelected(win.id, function (response){
                    var active_hostname = get_location(response.url).hostname;
                    //console.log('HOSTNAME: ', active_hostname);
                    settings.timerbutton_elapsed_times[active_hostname] = 0;
                });
            });
            
            chrome.tabs.executeScript(null, {file: "timer.js"});
        }
        
        // Messages from options page
        if (request.update_settings === true) {
            settings.load_settings();
        }
});

// Listen for closed tabs.
chrome.tabs.onRemoved.addListener(function(tab) {
    update_icon("off");
}); 

// Listen for connections from content scripts
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.name == "newtimer") {
            console.log("New timer!");
        }
        if (msg.name == "update") {
            update_times(msg.update, port.sender.tab);
        }
        // Messages from timeup page:
        if (msg.close_tabs === true) {
            chrome.tabs.remove(port.sender.tab.id);
        }

        if (msg.restart_timer === true) {
            console.log("restarting timer");
            //console.log(settings.restore_url);
            var reset_hostname = get_location(settings.restore_url).hostname;
            //console.log(reset_hostname);
            settings.elapsed_times[reset_hostname] = 0;
            chrome.tabs.update({url: settings.restore_url});
        }
    });
});

//var check_interval = 1000;
//var check_interval_set = false;
//set_check_interval();

/*function set_check_interval () {
    // Check for current tab time every check_interval milliseconds.
    console.log("set_check_interval()");
    if (check_interval_set === false) {
        check_interval_set = true;
        var checktime_interval_id = setInterval(check_times, check_interval);
    }
}*/


chrome.tabs.onUpdated.addListener(function(tab, changeInfo) {
    console.log("Tab updated!");    
    if(changeInfo.status === 'complete') {
        console.log("Change complete!");
        chrome.tabs.getSelected(null, function(tab) {
            var parsed_url = get_location(tab.url);
            console.log(parsed_url.hostname);
            if(/^(https?):/.test(tab.url)
               && (settings.blocklist.indexOf(parsed_url.hostname) !== -1)) {
                   console.log("Injecting timer script");
                   chrome.tabs.executeScript(tab.id, {file: "timer.js"});
            } else {
                console.log("Not on blocklist.");
            }
        });
    }
 });
            
/* function check_times () {
    console.log("check_times()");
    chrome.tabs.getSelected(null, function(tab) {
        //console.log(tab.url);
        var parsed_url = get_location(tab.url);
        //console.log(settings.blocklist);
        //console.log(tab.status, /^(https?):/.test(tab.url), (settings.blocklist.indexOf(parsed_url.hostname) !== -1));
        //console.log((tab.status === 'complete') 
        //    && /^(https?):/.test(tab.url)
        //    && (settings.blocklist.indexOf(parsed_url.hostname) !== -1));
        if(tab.status === 'complete' 
            && /^(https?):/.test(tab.url)
            && (settings.blocklist.indexOf(parsed_url.hostname) !== -1)) {
                chrome.tabs.executeScript(tab.id, {file: "check_timer.js"}, function () {
                    var port =  chrome.tabs.connect(tab.id, {name: "timecheck"});
                    port.postMessage({send_time: true});
                });
        } 
    });
} */

function update_icon(icon_status) {
    //console.log("update_icon()");
    chrome.browserAction.setIcon({path: "img/" + icon_status + ".png"});
    if (icon_status === "off") {
        chrome.browserAction.setBadgeText({text: ""}); }
}

function update_times (update, tab) {
    console.log("update_times()");
    console.log(update);
    if (update.current_time && update.hostname) {
            
            if (settings.blocklist.indexOf(update.hostname) !== -1) {
                var time_limit = settings.time_limits[update.hostname];
                var time_elapsed = settings.elapsed_times[update.hostname];
                settings.elapsed_times[update.hostname] = time_elapsed + (check_interval / 1000)
                console.log("Time spent: ", update.current_time);
                console.log("Time left: ", time_limit - time_elapsed);
                //console.log(settings.elapsed_times[response.url], settings.time_limits[response.url]);
            }

            else {
                var time_limit = settings.default_time_limit
                var time_elapsed = settings.timerbutton_elapsed_times[update.hostname];
                settings.timerbutton_elapsed_times[update.hostname] = time_elapsed + (check_interval / 1000)
                //console.log("changing times from a timerbutton");
            }

            update_icon("on");
            
            var badge_string = '';
            if (settings.show_badge === true) {
                var badge_string = Math.round((time_limit - time_elapsed)/60).toString();
                console.log(badge_string, time_limit, time_elapsed);
            }

            chrome.browserAction.setBadgeBackgroundColor({color: [99,99,99,255]});
            chrome.browserAction.setBadgeText({text: badge_string, tabId: tab.id});

            if (time_elapsed > time_limit) {
                console.log("Time's up!");
                settings.restore_url = tab.url;
                var timeup_url = chrome.extension.getURL('timeup.html');
                update_icon("off");
                chrome.tabs.update({url: timeup_url});
            }
    }
}
