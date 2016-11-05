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
    makeGetRequest(endpoint, function(response) {
        innerHtmlReplacementTarget.innerHTML = JSON.parse(response).contents;            
    });
}

function makeGetRequest(url, cb) {
    var handler = function() {
        cb(this.response);
    };
    var request = new XMLHttpRequest();
    affixEvent(request, "load", handler);
    request.open("GET", url);
    request.send();
}

function makePostRequest(url, cb) {
    var request = new XMLHttpRequest();
    affixEvent(request, "load", cb);
    request.open("POST", url);
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
},{identifer: "addShow", ev: "click", handler: clickDelegationHandler},
{identifer: "removeShow", ev: "click", handler: clickDelegationHandler}];

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
        "search-btn": sendUserToSearchResultsPage.bind(e.target, e),
        "addShow": addShowToLibraryAndToggleButtonVisibility.bind(e.target, e, qs("#removeShow")),
        "removeShow": removeShowFromLibraryAndToggleButtonVisibility.bind(e.target, e, qs("#addShow"))
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

function qs(selector) {
    return document.querySelector(selector);
}

function addShowToLibraryAndToggleButtonVisibility(e, togglePartner) {
    var showId = e.target.getAttribute("data-show-id");
    makePostRequest("/api/library/" + showId, function onSuccessToggleVisibility() {
        if (this.status === 200) {
            toggleElementVisibility(e.target);
            toggleElementVisibility(togglePartner);
        }
    });
}

function removeShowFromLibraryAndToggleButtonVisibility(e, togglePartner) {
    var showId = e.target.getAttribute("data-show-id");
    makePostRequest("/api/library/" + showId + "/remove", function onSuccessToggleVisibility() {
        if (this.status === 200) {
            toggleElementVisibility(e.target);
            toggleElementVisibility(togglePartner);
        }
    });
}

function toggleElementVisibility(element) {
    element.classList.toggle("uk-hidden");
}

function triggerSuccessNotification(message) {
    UIkit.notify({
       message: "<i class=\"uk-icon-check uk-icon-small\"></i>" + message,
       status: "success",
       timeout: 4000,
       post: "top-center"
    });
}

function triggerFailureNotification(message) {
    UIkit.notify({
       message: "<i class=\"uk-icon-close uk-icon-small\"></i>" + message,
       status: "warning",
       timeout: 4000,
       post: "top-center"
    });
}

affixEvent(window, "load", addEventsToDomNodes.bind(null, items));

