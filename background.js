var redirect_url = "file:///Users/connormendenhall/Javascript/Tabminder/timeup.html";
var blocklist = ['www.reddit.com', 'news.ycombinator.com'];
var time_limits = {'www.reddit.com':90, 'news.ycombinator.com':3};
var t_limit = 240;

function get_location(url) {
    var link = document.createElement("a");
    link.href = url;
    return link
}

// Listen for messages from content scripts.
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? 
                    "from a content script:" + sender.tab.url:
                    "from the extension");

        if (request.loaded === false) {
            var parsed_url = get_location(sender.tab.url);
            console.log(parsed_url.hostname);
            
            //var parsed_referrer_url = get_location(tab.url);
            //console.log(parsed_referrer_url.hostname);
            
            // If url is in blocklist, inject content script.
            if (blocklist.indexOf(parsed_url.hostname) != -1) {
                chrome.tabs.executeScript(sender.tab.id, 
                {file: "timer_content_script.js"}, function () {
                    chrome.tabs.executeScript(sender.tab.id, { code: "var timer_loaded = true;" }
                    );
                }); 
            }
            
            // If referrer url is in blocklist, inject content script.
            //if (blocklist.indexOf(parsed_referrer_url.hostname) != -1) {
                //chrome.tabs.executeScript(null, {file: "timer_content_script.js"
                //});
        }
        
        if (request.toggle_icon === "on") {
            update_icon("on");
        }
    
        if (request.toggle_icon === "off") {
            update_icon("off");
        }

        if (request.redirect) {
            chrome.tabs.update(sender.tab.id, {url: redirect_url});
            update_icon("off"); 
        }

        if (request.time_ticked && request.url) {
            var time_limit = time_limits[request.url];
            var time_left = time_limit - request.time_ticked;
            time_limits[request.url] = time_left;
            console.log("New time limits: ", time_limits);

            t_limit = t_limit - request.time_ticked;
            console.log("t_limit: ", t_limit);
        }
      
        if (request.current_time && request.url) {
            var time_limit = time_limits[request.url];
            if (request.current_time > time_limit) {
                chrome.tabs.update(sender.tab.id, {url: redirect_url});
                update_icon("off");
            }
        }
       
        if (request.get_time && request.url) {
            sendResponse({time_limit: t_limit}); 
        }
});

// React when user clicks browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	// Start timer in current tab
    console.log("Timer started!");
    chrome.tabs.executeScript(null, {file: "timer_content_script.js"});
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

// Check for current tab time every 30 seconds.
var checktime_interval_id = setInterval(check_times, 3000);
    
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
    chrome.tabs.getSelected(null, function(tab) {
        console.log("Sending request for time to tab ", tab.id);
        chrome.tabs.sendRequest(tab.id, {send_time: true} );
    });
}

function update_icon(icon_status) {
    chrome.browserAction.setIcon({path: icon_status + ".png"});
}
