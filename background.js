function get_location(url) {
    var link = document.createElement("a");
    link.href = url;
    return link
}

var blocklist = ['www.reddit.com', 'news.ycombinator.com', 'twitter.com'];
var time_limits = {'www.reddit.com':240, 'news.ycombinator.com':600, 'twitter.com':400};


// Listen for messages from content scripts.
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    	
    if (request.ticking) {
    	chrome.browserAction.setIcon({path:"on.png"});
    	sendResponse({recieved: true}); }
    
    if (request.stopped) {
    	chrome.browserAction.setIcon({path:"off.png"});
    	sendResponse({recieved: true}); }
    
    if (request.total_time && request.url) {
    	
    	var time_limit = time_limits[request.url];
    	var time_left = Math.round(time_limit - request.total_time);
    	chrome.browserAction.setBadgeText({text: time_left.toString()});
    	
    	if (request.total_time > time_limit) {
    		sendResponse({timeup: true}); }
    	}
    
    if (request.redirect) {
    	chrome.tabs.update(sender.tab.id, {url: "file:///Users/connormendenhall/Javascript/Tabminder/timeup.html"});
    	sendResponse({recieved: true}); }
    
    	
});

// Listen for new tabs.
chrome.tabs.onCreated.addListener(function(tab) {
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		
		var parsed_url = get_location(changeInfo.url);
		console.log(parsed_url.hostname);
		
		var	parsed_referrer_url = get_location(tab.url);
		console.log(parsed_referrer_url.hostname);
		
		// If url is in blocklist, inject content script.
		if (blocklist.indexOf(parsed_url.hostname) != -1) {
			chrome.tabs.executeScript(null, {file: "timer_content_script.js"}); }
		
		// If referrer url is in blocklist, inject content script.
		if (blocklist.indexOf(parsed_referrer_url.hostname) != -1) {
			chrome.tabs.executeScript(null, {file: "timer_content_script.js"}); }
			
		});
		
	});
  
// React when user clicks browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	// Start timer in current tab
	chrome.tabs.executeScript(null, {file: "timer_content_script.js"});
});	

