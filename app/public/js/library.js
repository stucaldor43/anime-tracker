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
    var vm = new Vue({
        el: "#activity-feed",
        data: {
            feed: [],
        },
        methods: {
            start: function() {
                setInterval(function() {
                    this.$http.get("/api/feed").then(function addNewSubstoriesToFeed(response) {
                        var substories = JSON.parse(response.data).data;
                        var lastFeedItem = this.feed[this.feed.length - 1];
                        var lastFeedItemTime = new Date(lastFeedItem.created_at).getTime();
                        
                        var newSubstories = substories
                            .reduce(getCollectionOfSubstoriesMergedWithAnimeObjects, [])
                            .filter(function retainOnlyNewSubstories(item) {
                                return new Date(item.created_at) > lastFeedItemTime;
                            }).sort(sortByDateAscending);
                        this.feed.push.apply(this.feed, newSubstories);
                    }.bind(this));
                }.bind(this), 10000);
            }
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
            this.start();
        }
    });
})();