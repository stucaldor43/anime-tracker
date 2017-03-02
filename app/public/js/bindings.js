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
            var request = new XMLHttpRequest();
            this.affixEvent(request, "load", cb);
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
            this.makeGetRequest(url, function() {
                if (this.status === 200) {
                    swapElement.innerHTML = this.response;
                }
            });
        }
    };
    
    var qs = w.animeTracker.helpers.qs;
    var affixEvent = w.animeTracker.helpers.affixEvent;
    
    function sendUserToSearchResultsPage(e) {
        var searchButton = document.getElementById("search-btn");
        var searchInput = document.getElementById("search-input");
        
        if ((e.target === searchInput && e.keyCode === 13) ||
        e.target === searchButton) {
            window.location.assign("/search/anime/" + encodeURI(searchInput.value)); 
        }
    }
    
    function retrieveAllAncestors(node) {
        var currentNode = node;
        var ancestors = [];
        var done = false;
        
        while (!done) {
            if (currentNode.tagName === "HTML") {
                done = true;
                break;
            }
            ancestors.push(currentNode.parentNode);
            currentNode = currentNode.parentNode;
        }
        return ancestors;
    }
    
    function subNavToggleHandler(e) {
        var formElement = qs(".genres-container form");
        var ancestors = retrieveAllAncestors(e.target);
        var eventTargetHasFormAncestor = (ancestors.indexOf(formElement) >= 0) ? true : false;
        var formIsVisible  = (formElement.style.display === "none") ? false : true;
        
        if (formIsVisible && !eventTargetHasFormAncestor) {
            formElement.style.display = "none";
            return;
        }
        else if (!formIsVisible && e.target === qs(".fake-link")) {
            formElement.style.display = "block";
        }
    }
    
    qs(".genres-container form").style.display = "none";
    affixEvent(qs("body"), "click", sendUserToSearchResultsPage);
    affixEvent(qs("body"), "keypress", sendUserToSearchResultsPage);
    affixEvent(qs("body"), "click", subNavToggleHandler);
})(window);