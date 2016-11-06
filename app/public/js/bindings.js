(function(w) {
    w.animeTracker = {}
    w.animeTracker.helpers = {
        qs: function qs(selector) {
            return document.querySelector(selector);    
        },
        affixEvent: function affixEvent(element, event_type, handler) {
            if (element.attachEvent) {
                element.attachEvent(event_type, handler);
                return;
            }
            element.addEventListener(event_type, handler);
        },
        makeGetRequest: function makeGetRequest(url, cb) {
            var handler = function() {
                cb(this.response);
            };
            var request = new XMLHttpRequest();
            this.affixEvent(request, "load", handler);
            request.open("GET", url);
            request.send();    
        },
        makePostRequest: function makePostRequest(url, cb) {
            var request = new XMLHttpRequest();
            this.affixEvent(request, "load", cb);
            request.open("POST", url);
            request.send();
        },
        importPartial: function importPartial(url, swapElementSelector) {
            var swapElement = this.qs(swapElementSelector);
            this.makeGetRequest(url, function(response) {
                swapElement.innerHTML = JSON.parse(response).contents;            
            });
        }
    };
    
    var qs = w.animeTracker.helpers.qs;
    var affixEvent = w.animeTracker.helpers.affixEvent;
    
    function sendUserToSearchResultsPage(e) {
        var searchButton = document.getElementById("search-btn");
        
        if (e.target !== searchButton && e.keyCode !== 13) {
            return;
        }
        
        var searchTerm = document.getElementById("search-input").value;
        window.location.assign("/search/anime/" + encodeURI(searchTerm)); 
    }
    
    affixEvent(qs("body"), "click", sendUserToSearchResultsPage);
    affixEvent(qs("body"), "keypress", sendUserToSearchResultsPage);
})(window);