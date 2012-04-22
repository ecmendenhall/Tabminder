function Settings () {
    this.blocklist = [];
    this.time_limits = {};
    this.elapsed_times = {};
    this.timerbutton_elapsed_times = {};
    this.default_time_limit = 600;
    this.redirect_url = "timeup.html";
    this.restore_url = "";
    this.show_badge = true;
    this.loaded = false;
    
}

Settings.prototype.load_settings = function () {

    function get_JSON_settings (name) {
        if (localStorage.getItem(name) === "undefined") {
            return {};
        }
        var stringified_settings = localStorage[name];
        var setting = JSON.parse(stringified_settings);
        return setting;
        }


    this.time_limits = get_JSON_settings('timesink_urls');
    for (url in this.time_limits) {
        this.blocklist.push(url);
        if (this.loaded === false)
            this.elapsed_times[url] = 0;
    }
    
    var extra_settings = get_JSON_settings('extra_settings');
    if (extra_settings.length > 0) {
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

// Listen for messages from content scripts.
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? 
                    "from a content script:" + sender.tab.url:
                    "from the extension");

        if (request.loaded === false) {
                       
            update_icon("off");

            var parsed_url = get_location(sender.tab.url);
            console.log(parsed_url.hostname);
            
            //var parsed_referrer_url = get_location(tab.url);
            //console.log(parsed_referrer_url.hostname);
            
            // If url is in blocklist, inject content script.
            if (settings.blocklist.indexOf(parsed_url.hostname) != -1) {
                chrome.tabs.executeScript(sender.tab.id, 
                {file: "timer.js"}, function () {
                    chrome.tabs.executeScript(sender.tab.id, { code: "var timer_loaded = true;" }
                    );
                }); 
            }
            
            // If referrer url is in blocklist, inject content script.
            //if (blocklist.indexOf(parsed_referrer_url.hostname) != -1) {
                //chrome.tabs.executeScript(null, {file: "timer.js"
                //});
        }

        // Messages from content script        
        if (request.toggle_icon === "on") {
            update_icon("on");
        }
    
        if (request.toggle_icon === "off") {
            update_icon("off");
        }

        if (request.redirect) {
            settings.restore_url = sender.tab.url;
            chrome.tabs.update(sender.tab.id, {url: settings.redirect_url});
            update_icon("off"); 
        }
      
        if (request.current_time && request.url) {
            var parsed_url = get_location(request.url);

            if (settings.blocklist.indexOf(parsed_url.hostname) != -1) {
                var time_limit = settings.time_limits[request.url];
                var time_elapsed = settings.elapsed_times[request.url];
                settings.elapsed_times[request.url] = time_elapsed + (check_interval / 1000)
                console.log(settings.elapsed_times[request.url], settings.time_limits[request.url]);
            }

            else {
                var time_limit = settings.default_time_limit
                var time_elapsed = settings.timerbutton_elapsed_times[request.url];
                settings.timerbutton_elapsed_times[request.url] = time_elapsed + (check_interval / 1000)
                console.log("changing times from a timerbutton");
            }
            
            var badge_string = '';
            if (settings.show_badge === true) {
                var badge_string = Math.round((time_limit - time_elapsed)/60).toString();
            }

            chrome.browserAction.setBadgeBackgroundColor({color: [99,99,99,255]});
            chrome.browserAction.setBadgeText({text: badge_string, tabId: sender.tab.id});

            

            if (time_elapsed > time_limit) {
                settings.restore_url = sender.tab.url;
                chrome.tabs.update(sender.tab.id, {url: settings.redirect_url});
                update_icon("off");
            }
        }
       
        if (request.get_time && request.url) {
            sendResponse({time_limit: settings.default_time_limit}); 
        }
        
        // Messages from timeup page
        if (request.close_tabs === true) {
            chrome.tabs.remove(sender.tab.id);
        }

        if (request.restart_timer === true) {
            console.log(settings.restore_url);
            var reset_hostname = get_location(settings.restore_url).hostname;
            console.log(reset_hostname);
            settings.elapsed_times[reset_hostname] = 0;
            chrome.tabs.update(sender.tab.id, {url: settings.restore_url});
        }
        
        // Messages from popup
        if (request.load_settings === true) {
            var options_url = chrome.extension.getURL('options.html')
            chrome.tabs.create({url: options_url });
        }

        if (request.add_page === true) {
            console.log("Adding page to timesinks!");
            chrome.windows.getCurrent(function(win) {
                chrome.tabs.getSelected(win.id, function (response){
                    var active_hostname = get_location(response.url).hostname;
                    settings.time_limits[active_hostname] = settings.default_time_limit / 60;
                    settings.save_settings('timesink_urls', settings.time_limits);
                    settings.load_settings();
                });
            });

        }

        if (request.start_timer === true) {
            console.log("Timer started!");
            
            chrome.windows.getCurrent(function(win) {
                chrome.tabs.getSelected(win.id, function (response){
                    var active_hostname = get_location(response.url).hostname;
                    console.log('HOSTNAME: ', active_hostname);
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


// Listen for new tabs.
chrome.tabs.onCreated.addListener(function(tab) {
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        
        if(changeInfo.status == "complete") {
            console.log("checking if timer loaded");
            chrome.tabs.executeScript(tabId, {file: "check_timer.js"});
        }
    });
});

// Listen for closed tabs.
chrome.tabs.onRemoved.addListener(function(tab) {
    update_icon("off");
}); 

var check_interval = 5000;
var check_interval_set = false;
set_check_interval();

function set_check_interval () {
    // Check for current tab time every check_interval milliseconds.
    console.log("set_check_interval()");
    if (check_interval_set === false) {
        check_interval_set = true;
        var checktime_interval_id = setInterval(check_times, check_interval);
    }
}
    
function send_closed_message (close_tab) {
    console.log(close_tab);
    chrome.tabs.get(close_tab, function(tab) {
        console.log("sending tab_closed to tab " + tab.id);
        chrome.tabs.sendRequest(tab.id, {close: true}, 
                                        function(response) {
            console.log(response.timer_stop); }); 
    });
}    

function check_times () {
    console.log("check_times()");
    chrome.tabs.getSelected(null, function(tab) {
        console.log("Sending request for time to tab ", tab.id);
        chrome.tabs.sendRequest(tab.id, {send_time: true}, function(response) {
            update_times(response, tab); } );
    });
}

function update_icon(icon_status) {
    console.log("update_icon()");
    chrome.browserAction.setIcon({path: "img/" + icon_status + ".png"});
    if (icon_status === "off") {
        chrome.browserAction.setBadgeText({text: ""}); }
}

function update_times (response, tab) {
    if (response.current_time && response.url) {
            
            var parsed_url = get_location(response.url);
            console.log(parsed_url.hostname);
            
            if (settings.blocklist.indexOf(response.url) != -1) {
                var time_limit = settings.time_limits[response.url];
                var time_elapsed = settings.elapsed_times[response.url];
                settings.elapsed_times[response.url] = time_elapsed + (check_interval / 1000)
                console.log(settings.elapsed_times[response.url], settings.time_limits[response.url]);
            }

            else {
                var time_limit = settings.default_time_limit
                var time_elapsed = settings.timerbutton_elapsed_times[response.url];
                settings.timerbutton_elapsed_times[response.url] = time_elapsed + (check_interval / 1000)
                console.log("changing times from a timerbutton");
            }
            
            var badge_string = '';
            if (settings.show_badge === true) {
                var badge_string = Math.round((time_limit - time_elapsed)/60).toString();
            }

            chrome.browserAction.setBadgeBackgroundColor({color: [99,99,99,255]});
            chrome.browserAction.setBadgeText({text: badge_string, tabId: tab.id});

            if (time_elapsed > time_limit) {
                settings.restore_url = tab.url;
                chrome.tabs.update(tab.id, {url: settings.redirect_url});
                update_icon("off");
            }
    }
}
