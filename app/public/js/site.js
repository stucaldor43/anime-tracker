window.addEventListener("load", function() {
    document.getElementById("search-btn").
    addEventListener("click", sendUserToSearchResultsPage);
    document.getElementById("search-input").
    addEventListener("keypress", sendUserToSearchResultsPage);
});

function sendUserToSearchResultsPage(e) {
    var searchButton = document.getElementById("search-btn");
    
    if (e.target !== searchButton && e.keyCode !== 13) {
        return;
    }
    
    var searchTerm = document.getElementById("search-input").value;
    window.location.href = "/search/anime/" + encodeURI(searchTerm); 
}