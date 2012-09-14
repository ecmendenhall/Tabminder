describe("Update icon", function() {

    beforeEach(function () {
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

        setIcon = spyOn(chrome.browserAction, 'setIcon');
        setBadgeText = spyOn(chrome.browserAction, 'setBadgeText');
                
        
    });
    
    it("Changes icon red if status is 'on'", function() {
        update_icon("on");
        expect(setIcon).toHaveBeenCalledWith({path: "/img/on.png"});
        });

    it("Changes icon gray if status is 'off'", function() {
        update_icon("off");
        expect(setIcon).toHaveBeenCalledWith({path: "/img/off.png"});
        });

    it("Removes badge if status is 'off'", function() {
        update_icon("off");
        expect(setBadgeText).toHaveBeenCalledWith({text: ""});
        });



});
