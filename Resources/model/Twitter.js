/**
 * twitter取得サービス
 * @target searchTweets or playerTweets
 */
function Twitter(target) {
    var util = require("/util/util").util;
    var style = require("/util/style").style;

    var self = {};
    self.loadTweets = loadTweets;
    var tweetsPerPage = 50;
    var queryBase = 
        "select * from json"
        + " where url='http://153.122.4.181/redsmylife/" + target + ".json"
        + "?count=" + tweetsPerPage;
    var oldestId;      //最も古いツイートID。古いデータ読み込み時に使用
    var newestId;    //最も新しいツイートID。新しいデータ読み込み時に使用
    
    /**
     * twitter apiを使用して#urawaredsのツイート一覧を取得
     * @param kind ("firstTime" or "olderTweets" or "newerTweets")
     * @param callback (TwitterWindow.js)
     */
    function loadTweets(kind, callback) {
        Ti.API.info('---------------------------------------------------------------------');
        Ti.API.info(util.formatDatetime() + '  twitter読み込み ' + kind);
        Ti.API.info('---------------------------------------------------------------------');
        // オンラインチェック
        if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
        }
        // Analytics
        trackAnalytics(kind);
        
        // YQL実行
        var before = new Date();
        var query = queryBase;
        if("newerTweets" == kind) {
            query += "&since_id=" + newestId;
        } else if("olderTweets" == kind){
            query += "&max_id=" + oldestId;
        }
        query += "'";
        Ti.API.info('★★query=' + query);
        Ti.Yahoo.yql(query, function(e) {
            try {
                if(e.data == null || !e.data.json) {
                    callback.fail(style.common.loadingFailMsg);
                    return;
                }
                if(e.data.json.json == "no data") {
                    callback.success(new Array());
                    return;
                }
                var resultArray = null;
                if(!e.data.json.json) {
                    Ti.API.info('e.data.jsonが１件のため配列に変換')
                    resultArray = new Array(e.data.json);
                } else {
                    resultArray = e.data.json.json;
                }
                    
                // 取得したJSONをリスト化する
                var idx = 0;
                var tweetList = resultArray.map(
                    function(item) {
                        if(idx++ == 0 && 
                            ("firstTime" == kind || "newerTweets" == kind)) {
                            newestId = item.tweet_id;
                        }
                        if("firstTime" == kind || "olderTweets" == kind) {
                            oldestId = item.tweet_id;
                        }
                        //「10秒前」のような形式
                        //var timeText = util.parseDate2(item.results.created_at);
                        var creDate = new Date(item.created_at);
                        var minutes = creDate.getMinutes();
                        if(minutes < 10) {
                            minutes = "0" + minutes;
                        }
                        var timeText = (creDate.getMonth() + 1) + "/" + creDate.getDate() 
                            + " " + creDate.getHours() + ":" + minutes;
 //                       Ti.API.info('★timeText=' + timeText);
                        var data = {
                            id: item.tweet_id
                            ,text: util.deleteUnnecessaryText(item.tweet)
                            ,profileImageUrl: item.user_profile_image_url
                            ,userName: item.user_name
                            ,userScreenName: item.user_screen_name
                            ,createDatetime: item.created_at 
                            ,timeText: timeText
                        };
                        return data;
                    }
                );
                Ti.API.info('+++++++++++++++++++ YQL終了.  ツイート件数＝' + tweetList.length)
                callback.success(tweetList);
            } catch(ex) {
                Ti.API.error('---------------------\n' + ex);  
                callback.fail(style.common.loadingFailMsg + " ¥n " + ex);
            } finally {
            }
            var after = new Date();
            Ti.API.info("Twitter.js#loadTweets() 処理時間★" 
                + (after.getTime()-before.getTime())/1000.0 + "秒");
        });
    }
    
    /**
     * Google Analyticsの記録
     * @param {Object} kind
     */
    function trackAnalytics(kind) {
        if("firstTime" == kind) {
            if(target == "playerTweets") {
                Ti.App.Analytics.trackPageview('/playerTweets');
            } else {
                Ti.App.Analytics.trackPageview('/twitter');
            }
        } else if("newerTweets" == kind) {
            if(target == "playerTweets") {
                Ti.App.Analytics.trackPageview('/newerPlayerTweets');
            } else {
                Ti.App.Analytics.trackPageview('/twitter/newerTweets');
            }
        } else {
            if(target == "playerTweets") {
                Ti.App.Analytics.trackPageview('/olderPlayerTweets');
            } else {
                Ti.App.Analytics.trackPageview('/twitter/olderTweets');
            }
        }
    }
    return self;
}
module.exports = Twitter;
