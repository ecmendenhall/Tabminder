describe("Check active tab", function() {

    beforeEach(function () {
        settings = new Settings();
        settings.blocklist = ['www.zombo.com'];
        settings.temp_blocklist = ['bitchinlasers.biz'];

        chrome = {
            tabs: {
                query: function(){ return [{url: 'http://www.zombo.com'}]; }
            }
        }
    
    spyOn(chrome.tabs, 'query');
    updateIcon = spyOn(window, 'update_icon');
    updateTimes = spyOn(window, 'update_times');    
        
    });

    it("Calls update_icon('on') and update_times if active hostname is in temporary blocklist", function() {
        runs(function() {
            var tab_array = [{url: 'http://bitchinlasers.biz/buymorelasers/', status: 'complete'}];
            var tab = tab_array[0];
            var parsed_url = get_location(tab.url);
            
            if(tab.status === 'complete' 
                && /^(https?):/.test(tab.url)) {
                    if (settings.blocklist.indexOf(parsed_url) !== -1 
                        || settings.temp_blocklist.indexOf(parsed_url) !== -1 ) {
                            update_icon("on");
                            update_times(tab, parsed_url);
                    } else {
                        update_icon("off");
                    }
            } else {
              update_icon("off");
            }
            expect(parsed_url).toEqual('bitchinlasers.biz');
            expect(updateIcon).toHaveBeenCalledWith("on");
            expect(updateTimes).toHaveBeenCalledWith({url: 'http://bitchinlasers.biz/buymorelasers/', 
                                                      status: 'complete'},
                                                     'bitchinlasers.biz');
        });

    });

    it("Calls update_icon('on') and update_times if active hostname is in blocklist", function() {
        runs(function() {
            var tab_array = [{url: 'http://www.zombo.com', status: 'complete'}];
            var tab = tab_array[0];
            var parsed_url = get_location(tab.url);
            
            if(tab.status === 'complete' 
                && /^(https?):/.test(tab.url)) {
                    if (settings.blocklist.indexOf(parsed_url) !== -1 
                        || settings.temp_blocklist.indexOf(parsed_url) !== -1 ) {
                            update_icon("on");
                            update_times(tab, parsed_url);
                    } else {
                        update_icon("off");
                    }
            } else {
              update_icon("off");
            }
            expect(parsed_url).toEqual('www.zombo.com');
            expect(updateIcon).toHaveBeenCalledWith("on");
            expect(updateTimes).toHaveBeenCalledWith({url: 'http://www.zombo.com', status: 'complete'},
                                                      'www.zombo.com');
        });

    });


    it("Calls update_icon('off') and skips update_times if active hostname is not in blocklist", function() {
        runs(function() {
            var tab_array = [{url: 'http://canabusmart.info', status: 'complete'}];
            var tab = tab_array[0];
            var parsed_url = get_location(tab.url);
            
            if(tab.status === 'complete' 
                && /^(https?):/.test(tab.url)) {
                    if (settings.blocklist.indexOf(parsed_url) !== -1 
                        || settings.temp_blocklist.indexOf(parsed_url) !== -1 ) {
                            update_icon("on");
                            update_times(tab, parsed_url);
                    } else {
                        update_icon("off");
                    }
            } else {
              update_icon("off");
            }
            expect(parsed_url).toEqual('canabusmart.info');
            expect(updateIcon).toHaveBeenCalledWith("off");
        });
    });

    it("Calls update_icon('off') and skips update_times if tab status is not complete", function() {
        runs(function() {
            var tab_array = [{url: 'http://canabusmart.info', status: 'loading'}];
            var tab = tab_array[0];
            var parsed_url = get_location(tab.url);
            
            if(tab.status === 'complete' 
                && /^(https?):/.test(tab.url)) {
                    if (settings.blocklist.indexOf(parsed_url) !== -1 
                        || settings.temp_blocklist.indexOf(parsed_url) !== -1 ) {
                            update_icon("on");
                            update_times(tab, parsed_url);
                    } else {
                        update_icon("off");
                    }
            } else {
              update_icon("off");
            }
            expect(parsed_url).toEqual('canabusmart.info');
            expect(updateIcon).toHaveBeenCalledWith("off");
        });
    });

    it("Calls update_icon('off') and skips update_times if tab's URL protocol is not http://", function() {
        runs(function() {
            var tab_array = [{url: 'chrome://extensions', status: 'complete'}];
            var tab = tab_array[0];
            var parsed_url = get_location(tab.url);
            
            if(tab.status === 'complete' 
                && /^(https?):/.test(tab.url)) {
                    if (settings.blocklist.indexOf(parsed_url) !== -1 
                        || settings.temp_blocklist.indexOf(parsed_url) !== -1 ) {
                            update_icon("on");
                            update_times(tab, parsed_url);
                    } else {
                        update_icon("off");
                    }
            } else {
              update_icon("off");
            }
            expect(parsed_url).toEqual('extensions');
            expect(updateIcon).toHaveBeenCalledWith("off");
        });
    });




});
