(function(helpers) {
    var affixEvent = helpers.affixEvent;
    var qs = helpers.qs;
    var makeGetRequest = helpers.makeGetRequest;
    
    function createPageStatusObject() {
        var pageNumber = 1;
        return {
            getPageNumber: function() {
                pageNumber += 1;
                return pageNumber;
            }
        };
    }
    
    var pageStatus = createPageStatusObject();
    
    affixEvent(qs(".result-wrapper"), "scroll", function() {
        if (this.scrollHeight - this.scrollTop === this.clientHeight) {
            makeGetRequest.call(helpers, "/api/search/anime/genres" + window.location.search + 
            "&page=" + pageStatus.getPageNumber(), function() {
                if (this.status === 200) {
                    qs(".result-wrapper").innerHTML += this.response;
                }
            });
        }
    });
})(window.animeTracker.helpers);