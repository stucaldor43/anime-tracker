(function(helpers) {
    var affixEvent = helpers.affixEvent;
    var qs = helpers.qs;
    var makePostRequest = helpers.makePostRequest;
    var makeGetRequest = helpers.makeGetRequest;
    
    affixEvent(window, "load", function() {
       var pathname = window.location.pathname;
       var showIdStartIndex = (pathname.lastIndexOf("/ani-") >= 0) ? pathname.lastIndexOf("/ani-") + 5 : pathname.lastIndexOf("/") + 1; 
       var showId = parseInt(pathname.substring(showIdStartIndex), 10);
       window.animeTracker.showId = showId;
    });
    affixEvent(qs("#removeShow"), "click", function(e) {
        var showId = window.animeTracker.showId;
        makePostRequest.call(helpers, "/api/library/" + showId + "/remove", function onSuccessToggleVisibility() {
            if (this.status === 200) {
                e.target.classList.add("uk-hidden");
                qs("[data-uk-dropdown]").classList.remove("uk-hidden");
            }
        }); 
    });
    affixEvent(qs("body"), "click", function(e) {
       var showId = window.animeTracker.showId;
       
       if (e.target.classList.length < 1) {
           return;
       }
       
       var url = {
           currently_watching: "/api/library/" + showId + "?status=currently-watching",
           plan_to_watch: "/api/library/" + showId + "?status=plan-to-watch",
           completed: "/api/library/" + showId + "?status=completed",
           on_hold: "/api/library/" + showId + "?status=on-hold",
           dropped: "/api/library/" + showId + "?status=dropped"
       }[e.target.classList[0]];
       
       if (!url) {
           return;
       }
       
       makeGetRequest.call(helpers, url, function() {
           if (this.status === 200) {
               qs("[data-uk-dropdown]").classList.add("uk-hidden");
               qs("#removeShow").classList.remove("uk-hidden");
           }
       });
    });
})(window.animeTracker.helpers);