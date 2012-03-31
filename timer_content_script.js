function Timer() {
	this.time_ticked = 0;
	this.total_seconds = 0;
	this.start_time = new Date();
	this.stop_time = new Date();
}

Timer.prototype.get_time_limit = function() {}
	

Timer.prototype.tick = function() {
	var total_time = this.total_seconds + this.time_ticked;
	console.log("Total time ticked: " + total_time);
	
	// Send background script total time to check if limit exceeded.
	chrome.extension.sendRequest({total_time: total_time}, function(response) {
		if (response.timeup) {
		
		// Send background script a message to redirect the page.
		chrome.extension.sendRequest({redirect: true}, function(response) {
			console.log(response);
			});	
		}	
			
		});
	
	now = new Date().getTime();
	this.time_ticked = (now - this.start_time) / 1000;
			
	thisObj = this;
	this.timeout_id = setTimeout(function() { thisObj.tick(); }, 1000); 

}
	
Timer.prototype.start = function() {
	console.log("Timer started!");
	
	// Send background script a message to update the icon.
	chrome.extension.sendRequest({ticking: true}, function(response) {
		console.log(response);
		});
		
	// Get a start time and begin ticking.
	this.start_time = new Date().getTime();
	this.tick();
	
}

Timer.prototype.stop = function() {
	console.log("Timer stopped!");
	
	thisObj = this;
	clearTimeout(this.timeout_id);
	
	// Calculate time in tab.
	this.total_seconds = this.total_seconds + this.time_ticked;
	console.log("Time ticked: " + this.time_ticked);
	console.log("Total time ticked: " + this.total_seconds);
	
	// Send background script a message to update the icon.
	chrome.extension.sendRequest({stopped: true}, function(response) {
		console.log(response);
		});	
}


// Listen for window focus
window.addEventListener('focus', function() {
	timer.start();
});

// Listen for window blur
window.addEventListener('blur', function() {
	timer.stop();	
});

timer = new Timer();
timer.start();


