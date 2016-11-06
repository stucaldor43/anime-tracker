(function(helpers) {
    var affixEvent = helpers.affixEvent;
    var qs = helpers.qs;
    var importPartial = helpers.importPartial;
    
    affixEvent(qs("#title-search-revealer"), "click", importPartial.bind(helpers, "/api/partials/anime-title-search-partial", "#search-wrapper"));
    affixEvent(qs("#genre-search-revealer"), "click", importPartial.bind(helpers, "/api/partials/anime-genre-search-form-partial", "#search-wrapper"));
})(window.animeTracker.helpers);
