function sendUserToSearchResultsPage(e) {
    var searchButton = document.getElementById("search-btn");
    
    if (e.target !== searchButton && e.keyCode !== 13) {
        return;
    }
    
    var searchTerm = document.getElementById("search-input").value;
    window.location.assign("/search/anime/" + encodeURI(searchTerm)); 
}

function transportPartial(e) {
    var target = e.target;
    var endpoint = target.getAttribute("data-endpoint");
    var innerHtmlReplacementTarget = document.getElementById(target.getAttribute("data-target"));
    fetchEndpointResponse(endpoint, function(response) {
        innerHtmlReplacementTarget.innerHTML = JSON.parse(response).contents;            
    });
}

function fetchEndpointResponse(url, cb) {
    var handler = function() {
        cb(this.response);
    };
    var request = new XMLHttpRequest();
    affixEvent(request, "load", handler);
    request.open("GET", url);
    request.send();
}

function affixEvent(element, event_type, handler) {
    if (element.attachEvent) {
        element.attachEvent(event_type, handler);
        return;
    }
    element.addEventListener(event_type, handler);
}