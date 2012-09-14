describe("Update times", function() {

    beforeEach(function () {
        settings = new Settings();
        settings.blocklist = ['www.zombo.com'];
        settings.temp_blocklist = ['canabusmart.info'];
        settings.show_badge = true;
        settings.default_time_limit = 12;
        settings.timerbutton_elapsed_times = {'canabusmart.info': 9};
        
        var check_interval = 1000;
        var tab = {id: 1234, url: 'http://canabusmart.info/news/'};
        
        update_times(tab, 'canabusmart.info');
        
    });

    it("Calculates time left if the hostname is in the temporary blocklist", function() {
        expect(settings.timerbutton_elapsed_times['canabusmart.info']).toEqual(10);
        });

});
