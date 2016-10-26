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

var items = [{identifier: "title-search-revealer",ev: "click" , handler: transportPartial},
{identifier: "genre-search-revealer", ev: "click", handler: transportPartial},
{identifier: "body", ev: "click", handler: clickDelegationHandler}, {
identifier: "body", ev: "keypress", handler: keypressDelegationHandler
}];

function addEventsToDomNodes(items) {
    items.forEach(function(item) {
        var element = document.getElementById(item.identifier);
        if (element) {
            affixEvent(element, item.ev, item.handler);
        }
    });
}

function clickDelegationHandler(e) {
    var handlers = {
        "search-btn": sendUserToSearchResultsPage.bind(e.target, e)
    };
    var handler = handlers[e.target.id];
    
    if (handler) {
        handler();
    }
}

function keypressDelegationHandler(e) {
    var handlers = {
        "search-input": sendUserToSearchResultsPage.bind(e.target, e)
    };
    var handler = handlers[e.target.id];
    
    if (handler) {
        handler();
    }
}

affixEvent(window, "load", addEventsToDomNodes.bind(null, items));

