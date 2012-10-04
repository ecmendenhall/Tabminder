$(document).ready(function(){
    $("#install-box").click(function(){ 
        chrome.webstore.install();
        _gaq.push(['_trackEvent', 'Install', 'Extension Install']);
    }); 
    $("#donate-button").click(function(){
        var amount = $("#prependedInput").value;
        amount = 10;
        _gaq.push(['_trackEvent', 'Donate', 'Donation', 'Donation', amount]);
    });
});
