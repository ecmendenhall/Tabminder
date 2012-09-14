describe("Set check interval", function() {

    beforeEach(function () {
        is_set = false;
    });
    
    it("checks if the interval is already set", function() {
        expect(set_check_interval(is_set)).toBe(true);
        });
});
