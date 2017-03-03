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
           decrementEpisodesWatched: function() {
                var showId = this.item.id;
                this.item.episodesWatched -= 1;
                var decreaseEpisodesWatched = this.$http.post("/api/library/" + showId + "/decrement-episodes");
                decreaseEpisodesWatched.then(function(response) {
                    if (response.status !== 200) {
                        this.item.episodes_watched += 1;
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
           removeFromLibrary: function() {
               var showId = this.item.id;
               this.$http.post("/api/library/" + showId + "/remove")
               .then(function() {
                   this.$dispatch("entryRemoved", showId);
               });
           },
           hideDropdown: function(e) {
               e.target.parentNode.style.display = "none";
           }
       }
    });
    
    var maxEntriesPerRequest = 8;
    
    var FILTER = "filter";
    var FETCH_ALL = "fetch";
    var REVEAL = "reveal";
    var UPDATE_STATUS = "update";
    
    function reducer(state, action) {
    	switch (action.type) {
    		case FETCH_ALL:
    			return Object.assign({}, state, {
    				allLibraryEntries: action.libraryEntries,
    				visibleLibraryEntries: action.postFetchVisibleLibraryEntries
    			});
    		case UPDATE_STATUS:
    			return Object.assign({}, state, {
    				allLibraryEntries: action.postUpdateLibraryEntries
    			});
    		case REVEAL:
    			return Object.assign({}, state, {
    				visibleLibraryEntries: action.revealedEntries
    			});
    		case FILTER:
    			return Object.assign({}, state, {
    				allLibraryEntries: action.postFilterLibraryEntries,
    				visibleLibraryEntries: action.visibleLibraryEntries
    			});
    		default:
    			return state;
    	}
    }
    
    function mutateVueInstanceData(instance, action) {
    	var newState = reducer(instance.$data, action);
    	instance.$data = Object.assign({}, instance.$data, newState);
    }
    var library = new Vue({
    	el: "#library-manager",
    	data: {
    		searchTerm: "",
    		allLibraryEntries: [],
    		visibleLibraryEntries: [],
    		username: window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1),
    		isViewingOwnPage: false
    	},
    	methods: {
    	    smartToggleMoreEntriesButtonVisibility: function() {
    	        var moreEntriesButton = document.querySelector(".load-entries-button");
    	        if (this.visibleLibraryEntries.length !== this.allLibraryEntries.length) {
    	            moreEntriesButton.style.display = "inline";
    	            return;
    	        }
    	        moreEntriesButton.style.display = "none";
    	    },
    		fetchLibraryEntries: function() {
    			var endpoint = "/api/user/" + this.username + "/library";
    			var libraryData = [];
    			var promise = this.$http.get(endpoint).then(function(response) {
    			    var parsedResponse = JSON.parse(response.body);
    			    if (parsedResponse.status === "fail") {
    			        throw new Error(parsedResponse.data[0].status);
    			        return;
    			    }
    				var userLibrary = parsedResponse.data;
    				["completed", "dropped", "on_hold", "plan_to_watch", "watching"].forEach(function(status) {
    					libraryData.push.apply(libraryData, userLibrary.lists[status]);
    				});
    				var libraryEntries = libraryData.map(function(animeListRecord) {
    					return {
    						coverImage: animeListRecord.anime.image_url_lge,
    						rating: animeListRecord.anime.average_score,
    						status: animeListRecord.list_status,
    						title: animeListRecord.anime.title_english,
    						episodesWatched: animeListRecord.episodes_watched,
    						id: animeListRecord.anime.id
    					};
    				});
    				mutateVueInstanceData(this, {
    					type: FETCH_ALL,
    					libraryEntries: libraryEntries,
    					postFetchVisibleLibraryEntries: []
    				});
    				return libraryEntries;
    			}.bind(this));
    			promise.then(function() {
    			    this.smartToggleMoreEntriesButtonVisibility();
    			}.bind(this));
    			return promise;
    		},
    		handleFilterToggle: function(e) {
    			var filteringCheckBoxes = document.querySelectorAll("[name='filter']");
    			if (!e.target.checked) {
    				this.filterLibraryEntries();
    				return;
    			}
    			
    			for (var i = 0; i < filteringCheckBoxes.length; i++) {
    				filteringCheckBoxes[i].checked = (e.target !== filteringCheckBoxes[i]) ? false : true;
    			}
    			this.fetchLibraryEntries().then(this.filterLibraryEntries);
    		},
    		filterLibraryEntries: function() {
    			var checkboxes = document.querySelectorAll("[name='filter']");
    			var selectedCheckBox;
    			for (var i = 0; i < checkboxes.length; i++) {
    				if (checkboxes[i].checked) {
    					selectedCheckBox = checkboxes[i];
    					break;
    				}
    			}
    			
    			var filterIsActive = (selectedCheckBox) ? true : false;
    			if (!filterIsActive) {
    				this.fetchLibraryEntries().then(this.revealMoreEntries);
    				return;
    			}
    			
    			var sortedLibraryEntries = this.allLibraryEntries.sort(function(a, b) {
    			    if (a.status === selectedCheckBox.value &&
    			    b.status === selectedCheckBox.value) {
    			        return -1;
    			    }
    			    else if (a.status === selectedCheckBox.value &&
    			    b.status !== selectedCheckBox.value) {
    			        return -1;
    			    }
    			    else if (a.status !== selectedCheckBox.value &&
    			    b.status === selectedCheckBox.value) {
    			        return 1;
    			    }
    			    else if (a.status !== selectedCheckBox.value &&
    			    b.status !== selectedCheckBox.value) {
    			        return 0;
    			    }
    			});
    			
    			var postFilterLibraryEntries = [];
    			for (var i = 0; i < sortedLibraryEntries.length; i++) {
    			    if (sortedLibraryEntries[i].status !== selectedCheckBox.value) {
    			        break;
    			    }
    			    postFilterLibraryEntries.push(sortedLibraryEntries[i]);
    			}
    			
    			mutateVueInstanceData(this, {
    				type: FILTER,
    				postFilterLibraryEntries: postFilterLibraryEntries,
    				visibleLibraryEntries: []
    			});
    			
    			this.revealMoreEntries();
    		},
    		updateAnimeStatus: function(id, status) {
    			var postUpdateLibraryContents = this.allLibraryEntries.map(function(animeListRecord) {
    				if (animeListRecord.id === id) {
    					animeListRecord.status = status;
    				}
    				return animeListRecord;
    			});
    			mutateVueInstanceData(this, {
    				type: UPDATE_STATUS,
    				postUpdateLibraryEntries: postUpdateLibraryContents
    			});
    		},
    		revealMoreEntries: function() {
    			var entries;
    			if (this.visibleLibraryEntries.length < this.allLibraryEntries.length) {
    				var difference = this.allLibraryEntries.length - this.visibleLibraryEntries.length;
    				if (difference <= maxEntriesPerRequest) {
    					entries = this.allLibraryEntries;
    				} else {
    					var numberOfVisibleEntries = this.visibleLibraryEntries.length;
    					entries = this.visibleLibraryEntries.concat(this.allLibraryEntries.slice(numberOfVisibleEntries, numberOfVisibleEntries + maxEntriesPerRequest));
    				}
    			} else {
    				entries = this.visibleLibraryEntries;
    			}
    			mutateVueInstanceData(this, {
    				type: REVEAL,
    				revealedEntries: entries
    			});
    			this.smartToggleMoreEntriesButtonVisibility();
    		},
    		loadMoreEntries: function() {
    			this.revealMoreEntries();
    		},
    		setIsViewingOwnPage: function() {
    			this.$http.get("/api/authorized/" + this.username).then(function(response) {
    				this.isViewingOwnPage = (response.status === 200) ? true : false;
    				return this.isViewingOwnPage;
    			});
    		},
    	},
    	created: function() {
    		this.fetchLibraryEntries().then(this.revealMoreEntries);
    		this.setIsViewingOwnPage();
    	}
    });
    library.$on("statusUpdated", function(id, status) {
    	this.updateAnimeStatus(id, status);
    });
    
    var myLazyLoad = new LazyLoad();
})();