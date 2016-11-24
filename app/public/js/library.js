(function() {
    var sortByDateAscending = function(a, b) {
        var elapsedTimeA = new Date(a.created_at).getTime();
        var elapsedTimeB = new Date(b.created_at).getTime();
        
        if (elapsedTimeA > elapsedTimeB) {
            return 1;    
        }
        else if (elapsedTimeA < elapsedTimeB) {
            return -1;
        }
        return 0;    
    };
    var getCollectionOfSubstoriesMergedWithAnimeObjects = function(prev, story_object) {
        var records = [];
        story_object.substories.forEach(function(substory) {
            substory.media = story_object.media;
            records.push(substory);
        });
        prev.push.apply(prev, records);
        return prev;
    };
    var activityFeed = new Vue({
        el: "#activity-feed",
        data: {
            feed: [],
            username: window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1)
        },
        methods: {
            // start: function() {
            //     setInterval(function() {
            //         this.$http.get("/api/feed").then(function addNewSubstoriesToFeed(response) {
            //             var substories = JSON.parse(response.data).data;
            //             var lastFeedItem = this.feed[this.feed.length - 1];
            //             var lastFeedItemTime = new Date(lastFeedItem.created_at).getTime();
                        
            //             var newSubstories = substories
            //                 .reduce(getCollectionOfSubstoriesMergedWithAnimeObjects, [])
            //                 .filter(function retainOnlyNewSubstories(item) {
            //                     return new Date(item.created_at) > lastFeedItemTime;
            //                 }).sort(sortByDateAscending);
            //             this.feed.push.apply(this.feed, newSubstories);
            //         }.bind(this));
            //     }.bind(this), 10000);
            // }
        },
        created: function() {
            Vue.http.get("/api/feed").then(function provideInitialSubstoriesToFeed(response) {
                var substories = JSON.parse(response.data).data;
                var allSubstories = substories
                    .reduce(getCollectionOfSubstoriesMergedWithAnimeObjects, [])
                    .sort(sortByDateAscending);
                this.feed.push.apply(this.feed, allSubstories);
                return response;
            }.bind(this));
            // this.start();
        }
    });
    
    Vue.component("library-entry", {
       template: "#record",
       props: ["item"],
       data: function() {
         return {
             styleObject: {
                 backgroundImage: "url" + "(" + this.item.anime.cover_image + ")",
                 backgroundSize: "100% 100%",
                 backgroundRepeat: "no-repeat",
                 paddingTop: "67%"
             }
         };
       },
       methods: {
           incrementEpisodesWatched: function() {
                var showId = this.item.anime.id;
                this.item.episodes_watched += 1;
                var incrementEpisodesWatched = this.$http.post("/api/library/" + showId + "/increment-episodes");
                incrementEpisodesWatched.then(function(response) {
                    if (response.status !== 200) {
                        this.item.episodes_watched -= 1;
                    }
                });
           },
           ratePositive: function() {
                var showId = this.item.anime.id;
                this.$http.post("/api/library/" + showId + "/positive-rating"); 
           },
           rateNeutral: function() {
                var showId = this.item.anime.id;
                this.$http.post("/api/library/" + showId + "/neutral-rating");  
           },
           rateNegative: function() {
                var showId = this.item.anime.id;
                this.$http.post("/api/library/" + showId + "/negative-rating");   
           },
           updateStatus: function(newStatus) {
               var initialStatus = this.item.status;
               this.item.status = newStatus;
               var showId = this.item.anime.id;
               var updateStatus = this.$http.get("/api/library/" + showId + "?status=" + newStatus);
               updateStatus.then(function(response) {
                    if (response.status !== 200) {
                        this.item.status = initialStatus;
                        UIkit.notify({
                           message: "<i class='uk-icon-close'></i>Failed to update the status of " + 
                                    this.item.anime.title + " to " + (newStatus.split("-").join(" ")), 
                           status: "info",
                           timeout: 5000,
                           pos: "bottom-center"
                        });
                    }  
                    return this.item.status;
               });
           },
           hideDropdown: function(e) {
               e.target.parentNode.style.display = "none";
           }
       }
    });
    
    var maxEntriesPerRequest = 8;
    var library = new Vue({
        el: "#library-manager",
        data: {
            searchTerm: "",
            libraryEntries: [],
            revealedEntries: []
        },
        methods: {
            fetchLibrary: function(e) {
                var promise = this.$http.get("/api/library/all");
                promise.then(function(response) {
                    return JSON.parse(response.body).data;
                }).then(function(entries) {
                    return entries.filter(function(item) {
                        var term = this.searchTerm;
                        
                        if (term.length > 0) {
                          return item.anime.title.toLowerCase().indexOf(term.toLowerCase()) >= 0; 
                        }
                        return true;
                    }.bind(this));
                }.bind(this))
                .then(function(filteredResults) {
                    this.libraryEntries = filteredResults;
                    return filteredResults;
                }.bind(this))
                .then(function(entries) {
                    if (entries.length < maxEntriesPerRequest) {
                        this.revealedEntries = entries;
                        return entries;
                    }
                    var initialEntries = entries.slice(0, maxEntriesPerRequest);
                    this.revealedEntries = initialEntries;
                    return initialEntries;
                }.bind(this));
            },
            scrollHandler: function() {
                var el = document.querySelector(".shelf-wrapper");
                if (el.scrollTop + el.offsetHeight >= el.scrollHeight - Math.floor(.80 * el.scrollHeight)) {
                    this.addMoreRevealedEntries();
                }
            },
            addMoreRevealedEntries: function() {
                var allEntries = this.libraryEntries;
                var revealedEntries = this.revealedEntries;
                if (allEntries.length === revealedEntries.length) {
                    return;
                }
                var startIndex = revealedEntries.length;
                var endIndex = (startIndex + maxEntriesPerRequest <= allEntries.length) ? startIndex + maxEntriesPerRequest : allEntries.length;
                var newlyRevealedEntries = this.libraryEntries.slice(startIndex, endIndex);
                this.revealedEntries.push.apply(this.revealedEntries, newlyRevealedEntries);
            }
        },
        created: function() {
            var promise = this.$http.get("/api/library/all");
            promise.then(function(response) {
                var allLibraryEntries = JSON.parse(response.body).data;
                this.libraryEntries.push.apply(this.libraryEntries, allLibraryEntries);
                return allLibraryEntries;
            }.bind(this))
            .then(function(entries) {
                if (entries.length < maxEntriesPerRequest) {
                    this.revealedEntries.push.apply(this.revealedEntries, entries);
                    return entries;
                }
                var initialEntries = entries.slice(0, maxEntriesPerRequest);
                this.revealedEntries.push.apply(this.revealedEntries, initialEntries);
                return initialEntries;
            }.bind(this));
        }
    });
})();