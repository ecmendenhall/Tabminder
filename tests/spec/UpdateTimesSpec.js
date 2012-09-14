describe("Time left", function() {

    beforeEach(function () {
        settings = new Settings();
        settings.blocklist = ['www.zombo.com'];
        settings.show_badge = true;
        settings.time_limits = {'www.zombo.com': 10};
        settings.elapsed_times = {'www.zombo.com': 6};
        settings.temp_blocklist = ['canabusmart.info'];
        settings.default_time_limit = 12;
        settings.timerbutton_elapsed_times = {'canabusmart.info': 9};
        
        var check_interval = 1000;
        var tab = {id: 1234, url: 'http://www.zombo.com/anything'};

        chrome = {
            extension: {
                getURL: function(){}},
            tabs: {
                update: function(){}},
            browserAction: {
                setBadgeText: function(){},
                setBadgeBackgroundColor: function(){},
                setIcon: function(){}
            }
        }

        spyOn(chrome.extension, 'getURL');
        spyOn(chrome.browserAction, 'setBadgeText');
        spyOn(chrome.browserAction, 'setBadgeBackgroundColor');

        update_times(tab, 'www.zombo.com');

        var tab = {id: 1234, url: 'http://canabusmart.info/news'};
        update_times(tab, 'canabusmart.info');

        
    });
    
    it("Calculates time left if the hostname is in the blocklist", function() {
        expect(settings.elapsed_times['www.zombo.com']).toEqual(7);
        });
    
    it("Calculates time left if the hostname is in the temporary blocklist", function() {
        expect(settings.timerbutton_elapsed_times['canabusmart.info']).toEqual(10);
        });

});
