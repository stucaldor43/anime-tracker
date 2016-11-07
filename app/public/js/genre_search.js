(function(helpers) {
    var affixEvent = helpers.affixEvent;
    var qs = helpers.qs;
    var makeGetRequest = helpers.makeGetRequest;
    var pageNumber = 2;
    
    affixEvent(qs(".result-wrapper"), "scroll", function() {
        if(this.scrollHeight - this.scrollTop === this.clientHeight) {
            makeGetRequest.call(helpers, "/api/search/anime/genres" + window.location.search + 
            "&page=" + pageNumber, function(res) {
                var parsedResponse = JSON.parse(res);
                
                if (parsedResponse.status !== 200) {
                    return;
                }
                
                qs(".result-wrapper").innerHTML += parsedResponse.contents;
                pageNumber++;
            });
        }
    });
})(window.animeTracker.helpers);