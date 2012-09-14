describe("Get Location", function() {
    it("returns the hostname when passed an URL", function() {
        expect(get_location("http://www.reddit.com")).toEqual("www.reddit.com");
        expect(get_location("http://news.ycombinator.com")).toEqual("news.ycombinator.com");
        expect(get_location("Crazytown Bananapants")).toEqual("hhacgljimpcjpmlgnojmdaaliniogcej");
        });
});
