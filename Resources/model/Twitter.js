/**
 * twitter取得サービス
 */
function Twitter() {
    var util = require("util/util").util;
    var style = require("util/style").style;

    var self = {};
    self.loadTweets = loadTweets;
    // YQL
    var tweetsPerPage = 50;
    var queryBase = 
        "select refresh_url, next_page,"
        + " results.id, results.from_user, results.from_user_id,"
        + " results.profile_image_url, results.text, results.created_at"
        + " from json"
        + " where url='http://search.twitter.com/search.json";
    var firstTimeParam = "?q=%23urawareds&rpp=" + tweetsPerPage;    //%23は#
    var nextPageParam;
    var refreshUrlParam;

    /**
     * オブジェクトが配列の場合にtrueを返す
     */
    // function isArray(input){
        // return typeof(input)=='object' && (input instanceof Array);
    // }
    
    /**
     * twitter apiを使用して#urawaredsのツイート一覧を取得
     * @param kind ("firstTime" or "olderTweets" or "newerTweets")
     * @param callback (TwitterWindow.js)
     */
    function loadTweets(kind, callback) {
        // オンラインチェック
        if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
        }
        // Analytics
        if("firstTime" == kind) {
            Ti.App.Analytics.trackPageview('/twitter');
        } else if("newerTweets" == kind) {
            Ti.App.Analytics.trackPageview('/twitter/newerTweets');
        } else {
            Ti.App.Analytics.trackPageview('/twitter/olderTweets');
        }
        // YQL実行
        var before = new Date();
        var query = queryBase;
        if("firstTime" == kind) {
            query += firstTimeParam + "'";
        } else if("newerTweets" == kind) {
            query += refreshUrlParam + "'";
        } else{
            query += nextPageParam + "'";
        }
        Ti.API.info('★★query=' + query);
        Ti.Yahoo.yql(query, function(e) {
            try {
                Ti.API.info('JSON length = ' + JSON.stringify(e.data.json, null, ' ').length);
                if(e.data == null /*|| isArray(e.data.json)*/) {
                    callback.fail(style.common.loadingFailMsg);
                    return;
                }
                if(!e.data.json.map) {
                    return;
                }
                    
                // ページネーション用パラメータ
//                    nextPageParam = e.data.json.next_page;
//                    Ti.API.info("★nextPageParam ====== " + nextPageParam);
                    // 取得したJSONをリスト化する
                var tweetList = e.data.json.map(
                    function(item) {
                        // ページネーション用パラメータ
                        if("newerTweets" != kind) {
                            nextPageParam = item.next_page + "&rpp=" + tweetsPerPage;
                        }
                        refreshUrlParam = item.refresh_url;
                        //「10秒前」のような形式
                        //var timeText = util.parseDate2(item.results.created_at);
                        var creDate = util.parseDate(item.results.created_at);
                        var minutes = creDate.getMinutes();
                        if(minutes < 10) {
                            minutes = "0" + minutes;
                        }
                        var timeText = (creDate.getMonth() + 1) + "/" + creDate.getDate() 
                            + " " + creDate.getHours() + ":" + minutes;
                        
                        var data = {
                            id: item.results.id
                            ,text: util.deleteUnnecessaryText(item.results.text)
                            ,profileImageUrl: item.results.profile_image_url
                            ,userName: item.results.from_user
                            ,userId: item.results.from_user_id
                            ,createDatetime: item.results.created_at 
                            ,timeText: timeText
                        };
                        return data;
                    }
                );
                callback.success(tweetList);
                Ti.API.info('+++++++++++++++++++ YQL終了')
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
    return self;
}
module.exports = Twitter;
