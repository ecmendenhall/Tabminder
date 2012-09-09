function Timer() {
    this.time_ticked = 0;
    this.total_time = 0;
    this.start_time = new Date().getTime();
    this.ticking = false;
    this.tick_timeout = new Number();
}

Timer.prototype.tick = function () {
    //console.log("tick()");
    if (this.ticking === true) {
        var now = new Date().getTime();
        this.time_ticked = (now - this.start_time) / 1000;
        //console.log("time_ticked: ", this.time_ticked);
        thisObj = this;
        var tick_timeout = setTimeout(function() { thisObj.tick(); }, 
                                      1000);
        this.tick_timeout = tick_timeout;
        //console.log("timeout ids :", this.tick_timeouts.length);
        //console.log("timeout id: ", tick_timeout);
    }
};

Timer.prototype.start = function () {
    if (this.ticking === false) {
        //console.log("start()");
        this.toggle_icon("on");
        this.start_time = new Date().getTime();
        this.ticking = true;
        this.tick();
    }
};

Timer.prototype.stop = function () {
    this.ticking = false;
    //console.log("stop()");
    this.toggle_icon("off");
    //this.send_time();
    //console.log("clearing timeout id: ", this.tick_timeout);
    clearTimeout(this.tick_timeout);
    this.total_time = this.total_time + this.time_ticked;
    this.reset();
    //}
};

Timer.prototype.reset = function () {
    //console.log("reset()");
    this.time_ticked = 0;
};

Timer.prototype.toggle_icon = function (status) {
    chrome.extension.sendRequest({toggle_icon: status});
}


function main () {
    //console.log("main()");
    timer = new Timer();
    timer.start();

    // Listen for window focus
    window.addEventListener('focus', function () { 
        timer.start();
        //console.log("focus");
        } );

    // Listen for window activity
    window.addEventListener('activate', function () {
        timer.start();
        //console.log("focus");
        } );

    // Listen for mouse activity
    window.addEventListener('DOMMouseScroll', function () {
        timer.start();
        //console.log("focus");
        } );

    // Listen for window blur
    window.addEventListener('blur', function () { 
        timer.stop();
        //console.log("blur"); 
        } );

    // Listen for incoming connections from background script
    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
            if (msg.send_time == true) {
                var sendport = chrome.extension.connect();
                if (timer.ticking) {
                    var current_time = timer.time_ticked + timer.total_time; 
                } else {
                    var current_time = timer.total_time;
                    }
                sendport.postMessage({name: "update",
                                      update: { current_time: current_time, 
                                                url: location.hostname}
                                      });
            }
        });
    });

}

main();
