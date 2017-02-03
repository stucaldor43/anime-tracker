(function() {
    var activityFeed = new Vue({
        el: "#activity-feed",
        data: {
            feed: [],
            username: window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1)
        },
        methods: {
            start: function() {
                setInterval(function() {
                    Vue.http.get("/api/feed/" + this.username)
                    .then(function(response) {
                        this.feed = JSON.parse(response.body).data.map(function(activity) {
                            return {
                                status: activity.status,
                                title: activity.series.title_english,
                                dateCreated: activity.created_at,
                                episodeNumber: activity.value || null,
                                id: activity.series.id
                            };
                        });
                    }.bind(this));    
                }.bind(this), 20000);
            }
        },
        created: function() {
            Vue.http.get("/api/feed/" + this.username)
            .then(function(response) {
                this.feed = JSON.parse(response.body).data.map(function(activity) {
                    return {
                        status: activity.status,
                        title: activity.series.title_english,
                        dateCreated: activity.created_at,
                        episodeNumber: activity.value || null,
                        id: activity.series.id
                    };
                });
            }.bind(this));
            this.start();
        }
    });
    
    Vue.component("library-entry", {
       template: "#record",
       props: ["item", "canModifyLibrary"],
       data: function() {
         return {};
       },
       methods: {
           incrementEpisodesWatched: function() {
                var showId = this.item.id;
                this.item.episodesWatched += 1;
                var incrementEpisodesWatched = this.$http.post("/api/library/" + showId + "/increment-episodes");
                incrementEpisodesWatched.then(function(response) {
                    if (response.status !== 200) {
                        this.item.episodes_watched -= 1;
                    }
                });
           },
           ratePositive: function() {
                var showId = this.item.id;
                this.$http.post("/api/library/" + showId + "/positive-rating"); 
           },
           rateNeutral: function() {
                var showId = this.item.id;
                this.$http.post("/api/library/" + showId + "/neutral-rating");  
           },
           rateNegative: function() {
                var showId = this.item.id;
                this.$http.post("/api/library/" + showId + "/negative-rating");   
           },
           updateStatus: function(newStatus) {
               var initialStatus = this.item.status;
               this.item.status = newStatus;
               var showId = this.item.id;
               var updateStatus = this.$http.get("/api/library/" + showId + "?status=" + newStatus);
               updateStatus.then(function(response) {
                    if (response.status !== 200) {
                        this.item.status = initialStatus;
                        UIkit.notify({
                           message: "<i class='uk-icon-close'></i>Failed to update the status of " + 
                                    this.item.title + " to " + (newStatus.split("-").join(" ")), 
                           status: "info",
                           timeout: 5000,
                           pos: "bottom-center"
                        });
                        throw Error("Failed to update status");
                    } 
                    this.$dispatch("statusUpdated", showId, newStatus);
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
            revealedEntries: [],
            username: window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1),
            isViewingOwnPage: false
        },
        methods: {
            fetchLibrary: function(e) {
                this.libraryEntries = [];
                this.revealedEntries = [];
                var getResponse = function(response) {
                    var animelist = JSON.parse(response.body).data;
                    var allLibraryEntries = [];
                    ["completed", "dropped", "on_hold", "plan_to_watch", "watching"]
                    .forEach(function(status) {
                        allLibraryEntries.push.apply(allLibraryEntries, animelist.lists[status]);
                    });
                    
                    return allLibraryEntries.map(function(animeListRecord) {
                        return {
                            coverImage: animeListRecord.anime.image_url_lge,
                            rating: animeListRecord.anime.average_score,
                            status: animeListRecord.list_status,
                            title: animeListRecord.anime.title_english,
                            episodesWatched: animeListRecord.episodes_watched,
                            id: animeListRecord.anime.id
                        };
                    });
                };
                var filterEntries = function(entries) {
                    return entries.filter(function(item) {
                        var term = this.searchTerm;
                        
                        if (term.length > 0) {
                          return item.title.toLowerCase().indexOf(term.toLowerCase()) >= 0; 
                        }
                        return true;
                    }.bind(this));
                }.bind(this);
                var setLibraryEntries = function(filteredResults) {
                    this.libraryEntries.push.apply(this.libraryEntries, filteredResults);
                    return filteredResults;
                }.bind(this);
                var setRevealedEntries = function(entries) {
                    if (this.revealedEntries.length >= maxEntriesPerRequest) {
                        return;
                    }
                    
                    if ((maxEntriesPerRequest - this.revealedEntries.length) <= entries.length) {
                        this.revealedEntries.push.apply(this.revealedEntries, entries.slice(0, maxEntriesPerRequest - this.revealedEntries.length)); 
                    }
                    else {
                        this.revealedEntries.push.apply(this.revealedEntries, entries); 
                    }
                }.bind(this);
                
                var endpoint = "/api/user/" + this.username + "/library";
                
                
                var promise = this.$http.get(endpoint);
                promise.then(getResponse).then(filterEntries).then(setLibraryEntries).then(setRevealedEntries);    
                
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
            },
            setIsViewingOwnPage: function() {
                var username = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
                var promise = this.$http.get("/api/authorized/" + username);
                promise.then(function(response) {
                    this.isViewingOwnPage = (response.status === 200) ? true : false;
                    return this.isViewingOwnPage;
                });
            },
            updateAnimeStatus: function(id, newStatus) {
                this.revealedEntries = this.revealedEntries.map(function(entry) {
                    if (entry.id === id) {
                        entry.id = id;
                        return entry;
                    }
                    return entry;
                });
            }
        },
        created: function() {
            var addNextNEntries = function(response) {
                var animelist = JSON.parse(response.body).data;
                var allLibraryEntries = [];
                ["completed", "dropped", "on_hold", "plan_to_watch", "watching"]
                .forEach(function(status) {
                    allLibraryEntries.push.apply(allLibraryEntries, animelist.lists[status]);
                });
                
                this.libraryEntries.push.apply(this.libraryEntries, allLibraryEntries.map(function(animeListRecord) {
                    return {
                        coverImage: animeListRecord.anime.image_url_lge,
                        rating: animeListRecord.anime.average_score,
                        status: animeListRecord.list_status,
                        title: animeListRecord.anime.title_english,
                        episodesWatched: animeListRecord.episodes_watched,
                        id: animeListRecord.anime.id
                    };
                }));
                return this.libraryEntries;
            }.bind(this);
            var addToRevealedEntries = function(entries) {
                if (this.revealedEntries.length >= maxEntriesPerRequest) {
                    return;
                }
                
                if ((maxEntriesPerRequest - this.revealedEntries.length) <= entries.length) {
                    this.revealedEntries.push.apply(this.revealedEntries, entries.slice(0, maxEntriesPerRequest - this.revealedEntries.length)); 
                }
                else {
                    this.revealedEntries.push.apply(this.revealedEntries, entries); 
                }
            }.bind(this);
            var endpoint = "/api/user/" + this.username + "/library";
            
            
            var promise = this.$http.get(endpoint);
            promise.then(addNextNEntries).then(addToRevealedEntries);    
            
            this.setIsViewingOwnPage();
        }
    });
    library.$on("statusUpdated", function(id, status) {
        this.updateAnimeStatus(id, status);
    });
    
    var myLazyLoad = new LazyLoad();
})();