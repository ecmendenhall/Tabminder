function Timer() {
	this.time_ticked = 0;
	this.total_time_ticked = 0;
	this.start_time = new Date().getTime();
	this.ticking = false;
}
	

Timer.prototype.tick = function() {
	
	if (this.ticking) {
		
		console.log("Tick!");
		
		var total_time = this.total_time_ticked + this.time_ticked;
		console.log("Total time ticked: " + total_time);
	
		// Send background script total time and current site url to check if limit exceeded.
		chrome.extension.sendRequest({total_time: total_time, url: location.hostname}, function(response) {
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
	
}
	
Timer.prototype.start = function() {
	console.log("Timer started!");
	
	// Send background script a message to update the icon.
	chrome.extension.sendRequest({ticking: true}, function(response) {
		console.log(response);
		});
			
	// Get a start time and begin ticking.
	this.start_time = new Date().getTime();
	this.ticking = true;
	this.tick();
	
}

Timer.prototype.stop = function() {
	console.log("Timer stopped!");
	
	this.ticking = false;
	
	// Send background script a message to update the icon.
	chrome.extension.sendRequest({stopped: true}, function(response) {
		console.log(response);
	});
		
	// Calculate time in tab.
	this.total_time_ticked = this.total_time_ticked + this.time_ticked;
	
	this.time_ticked = 0;
	console.log("Time ticked: " + this.time_ticked);
	console.log("Total time ticked: " + this.total_time_ticked);

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


