/**
 * twitter取得サービス
 */
function Twitter() {
    var util = require("util/util").util;

    var self = {};
    self.loadTweets = loadTweets;
    // YQL
    var tweetsPerPage = 25;
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
     * twitter apiを使用して#urawaredsのツイート一覧を取得
     * @param kind ("firstTime" or "olderTweets")
     * @param callback (TwitterWindow.js)
     */
    function loadTweets(kind, callback) {
        // オンラインチェック
        if(!Ti.Network.online) {
            util.openOfflineMsgDialog();
        }
        // Analytics
        if("firstTime" == kind) {
            Ti.App.Analytics.trackPageview('/twitter');
        } else {
            Ti.App.Analytics.trackPageview('/twitter/olderTweets');
        }
        // YQL実行
        var before = new Date();
        var query = queryBase;
        if("firstTime" == kind) {
            query += firstTimeParam + "'";
        } else{
            query += nextPageParam + "'";
        }
        Ti.API.info('★★query=' + query);
            Ti.Yahoo.yql(query, function(e) {
                try {
                    if(e.data == null) {
                        callback.fail();
                        return;
                    }
                    // ページネーション用パラメータ
                    nextPageParam = e.data.json.next_page;
                    Ti.API.info("★nextPageParam ====== " + nextPageParam);
                    // 取得したJSONをリスト化する
                    var tweetList = e.data.json.map(
                        function(item) {
                            // ページネーション用パラメータ
                            nextPageParam = item.next_page + "&rpp=" + tweetsPerPage;
                            refreshUrlParam = item.refresh_url;
                            var timeText = util.parseDate2(item.results.created_at);
                            var data = {
                                id: item.results.id
                                ,text: item.results.text
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
