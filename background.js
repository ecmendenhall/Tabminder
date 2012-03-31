var time_limit = 600;
var blocklist = ["http://www.reddit.com/", "http://news.ycombinator.com/", "http://twitter.com/"];


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
    
    if (request.total_time) {
    	
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
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
		console.log(changeInfo.url);
		console.log(blocklist.indexOf(changeInfo.url));
		if (blocklist.indexOf(changeInfo.url) != -1) {
			chrome.tabs.executeScript(null, {file: "timer_content_script.js"}); }
		});
	});
  
// React when user clicks browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	// Start timer in current tab
	chrome.tabs.executeScript(null, {file: "timer_content_script.js"});
});	

