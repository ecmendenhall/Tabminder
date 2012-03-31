var time_limit = 20;

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
    
    if (request.total_time > time_limit) {
    	sendResponse({timeup: true}); }
    
    if (request.redirect) {
    	chrome.tabs.update(sender.tab.id, {url: "file:///Users/connormendenhall/Javascript/Tabminder/timeup.html"});
    	sendResponse({recieved: true}); }
    
    	
});
  
// React when user clicks browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	// Start timer in current tab
	chrome.tabs.executeScript(null, {file: "timer_content_script.js"});
});	

