(function(helpers) {
    var affixEvent = helpers.affixEvent;
    var qs = helpers.qs;
    var makeGetRequest = helpers.makeGetRequest;
    var pageNumber = 2;
    
    affixEvent(qs(".result-wrapper"), "scroll", function() {
        if(this.scrollHeight - this.scrollTop === this.clientHeight) {
            makeGetRequest.call(helpers, "/api/search/anime/genres" + window.location.search + 
            "&page=" + pageNumber, function() {
                if (this.status === 200) {
                    qs(".result-wrapper").innerHTML += this.response;
                    pageNumber++;
                }
            });
        }
    });
})(window.animeTracker.helpers);