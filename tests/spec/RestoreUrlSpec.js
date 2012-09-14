describe("Time's up", function() {

    beforeEach(function () {
        settings = new Settings();
        settings.blocklist = ['www.zombo.com'];
        settings.show_badge = true;
        settings.time_limits = {'www.zombo.com': 5};
        settings.elapsed_times = {'www.zombo.com': 10};
        
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
        fakeUpdate = spyOn(chrome.tabs, 'update');

        update_times(tab, 'www.zombo.com');
        
    });
    
    it("Stores a restore URL if the time limit is up", function() {
        expect(settings.restore_url).toEqual('http://www.zombo.com/anything');
        });
    
    it("Redirects tab to timeup page", function() {
        expect(fakeUpdate).toHaveBeenCalled();
    });

});

