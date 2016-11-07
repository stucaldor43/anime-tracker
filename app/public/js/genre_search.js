(function(helpers) {
    var affixEvent = helpers.affixEvent;
    var qs = helpers.qs;
    var makeGetRequest = helpers.makeGetRequest;
    var pageNumber = 2;
    
    affixEvent(qs(".result-wrapper"), "scroll", function() {
        if(this.scrollHeight - this.scrollTop === this.clientHeight) {
            makeGetRequest.call(helpers, "/api/search/anime/genres" + window.location.search + 
            "&page=" + pageNumber, function(response) {
                this.innerHTML += response;
                pageNumber++;
            }.bind(this));
        }
    });
})(window.animeTracker.helpers);