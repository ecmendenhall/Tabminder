function Timer() {
    this.time_ticked = 0;
    this.start_time = new Date().getTime();
    this.ticking = false;
    this.tick_timeout = new Number();
}

Timer.prototype.tick = function () {
    console.log("tick()");
    if (this.ticking === true) {
        var now = new Date().getTime();
        this.time_ticked = (now - this.start_time) / 1000;
        console.log("time_ticked: ", this.time_ticked);
        thisObj = this;
        var tick_timeout = setTimeout(function() { thisObj.tick(); }, 1000);
        this.tick_timeout = tick_timeout;
        //this.tick_timeouts.push(tick_timeout_id);
        //console.log("timeout ids :", this.tick_timeouts.length);
        console.log("timeout id: ", tick_timeout);
    }
    if (this.time_ticked > this.time_limit) {
        this.send_redirect_alarm();
    }
};

Timer.prototype.start = function () {
    if (this.ticking === false) {
        console.log("start()");
        this.toggle_icon("on");
        this.get_time_limit();
        this.start_time = new Date().getTime();
        this.ticking = true;
        this.tick();
    }
        
};

Timer.prototype.stop = function () {
    this.ticking = false;
    console.log("stop()");
    this.toggle_icon("off");
    this.send_time();
    console.log("clearing timeout id: ", this.tick_timeout);
    clearTimeout(this.tick_timeout);
    this.reset();
    //for (var i = 0; i < this.tick_timeouts.length; i++) {
    //    var tick_timeout_id = this.tick_timeouts.pop(i);
    //    console.log("clearing timeout for id: ", tick_timeout_id);
    //    window.clearTimeout(tick_timeout_id);
    //}
};

Timer.prototype.reset = function () {
    console.log("reset()");
    this.time_ticked = 0;
};

Timer.prototype.send_time = function () {
    chrome.extension.sendRequest({time_ticked: this.time_ticked,
                                  url: location.hostname});
};

Timer.prototype.get_time_limit = function () {
    chrome.extension.sendRequest({get_time: true,
                                  url: location.hostname},
        function(response) {
            if (response.time_limit) {
                // Set time limit
                this.time_limit = response.time_limit;
                }
        });
};

Timer.prototype.toggle_icon = function (status) {
    chrome.extension.sendRequest({toggle_icon: status});
}

Timer.prototype.send_redirect_alarm = function () {
    chrome.extension.sendRequest({redirect: true});
}



function main () {
    console.log("main()");
    timer = new Timer();
    timer.start();

    // Listen for window focus
    window.addEventListener('focus', function () { 
        timer.start();
        console.log("focus");
        } );

    // Listen for window blur
    window.addEventListener('blur', function () { 
        timer.stop();
        console.log("blur"); 
        } );

   
    chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? 
                    "from a content script:" + sender.tab.url:
                    "from the extension");
        
        // Listen for tab close
        if (request.close === true) {
           sendResponse({timer_stop: "stopped"});
           timer.stop();
        }

        // Listen for time requests
        if (request.send_time === true) {
           chrome.extension.sendRequest({current_time: timer.time_ticked, url: location.hostname});
        }

    });
}

main();
