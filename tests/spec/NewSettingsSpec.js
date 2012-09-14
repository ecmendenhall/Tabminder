describe("New Settings", function() {
    
    beforeEach(function () {
      this.addMatchers({
           toBeEmpty: function(object) {
               for (var i in object) { 
                   return false;
               }
               return true;
           }
       })
       
       settings = new Settings();
       
    });

    it("Initializes settings with right set of empty arrays, dicts, and parameters", function() {
        expect(settings.blocklist.length).toEqual(0);
        expect(settings.time_limits).toBeEmpty();
        expect(settings.elapsed_times).toBeEmpty();
        expect(settings.timerbutton_elapsed_times).toBeEmpty();
        expect(settings.temp_blocklist.length).toEqual(0);
        expect(settings.default_time_limit).toEqual(600);
        expect(settings.restore_url).toBe("");
        expect(settings.show_badge).toBe(false);
        expect(settings.loaded).toBe(false);
    });

    it("Saves and restores settings from localstorage", function() {
        var fake_settings = {"www.zombo.com":300,"bitchinlasers.info":600}
        settings.save_settings('fake_settings', fake_settings);
        var stored_settings = JSON.parse(localStorage['fake_settings']);
        console.log(stored_settings);
        expect(stored_settings['www.zombo.com']).toEqual(300);
        expect(stored_settings['bitchinlasers.info']).toEqual(600);
    
    });

});
