/**
 * Twitter画面UI
 */
function TwitterWindow(tabGroup) {
    var Twitter = require("model/Twitter");
    var WebWindow = require("ui/handheld/WebWindow");    
    var util = require("util/util").util;
    var style = require("util/style").style;
    var updating = false;
    var loadingRow = Ti.UI.createTableViewRow(style.twitter.loadingRow);
    var loadingInd = Ti.UI.createActivityIndicator(style.twitter.loadingIndicator);
    loadingInd.message = style.common.loadingMsg;
    loadingRow.add(loadingInd);

    // 更新ボタン
    var refreshButton = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.REFRESH
    });
    // ウィンドウ
    var self = Ti.UI.createWindow({
        title: L('twitter')
        ,navBarHidden: false
        ,backgroundColor: 'black'
        ,barColor: 'red'
        ,rightNavButton: refreshButton
    });
    
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator();
    self.add(indicator);

/*
    // ボーダー
    var border = Ti.UI.createView(style.twitter.tableBorder);
    // テーブルヘッダ
    var tableHeader = Ti.UI.createView(style.twitter.tableHeader);
    // fake it til ya make it..  create a 2 pixel
    // bottom border
    tableHeader.add(border);
    // 矢印
    var arrow = Ti.UI.createView(style.twitter.arrow);
    // ステータスラベル
    var statusLabel = Ti.UI.createLabel(style.twitter.statusLabel);
    // 最終更新日時ラベル
    var lastUpdatedLabel = Ti.UI.createLabel(style.twitter.lastUpdatedLabel);
    lastUpdatedLabel.text = "最終更新: "+util.formatDatetime();

    // インジケータ
    var refreshActInd = Titanium.UI.createActivityIndicator(style.twitter.refreshActIndicator);
    // テーブルヘッダに矢印、ステータス、最終更新日時、インジケータを追加し、
    // テーブルにヘッダをセット
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(refreshActInd);
    table.headerPullView = tableHeader;
    // フラグ
    var pulling = false;
    var reloading = false;
*/

    
    //openイベント
    self.addEventListener('open', function(e) {
        loadTweets("firstTime");
    });
    
    // テーブル
    var table = Ti.UI.createTableView(style.twitter.table);
    table.allowsSelectionDuringEditing = false;

    //refreshイベント
    refreshButton.addEventListener('click', function(e){
        if(table.data[0]) {
            loadTweets("newerTweets");
        } else {
            table.setData(null);            loadTweets("firstTime");
        }
    });

    var twitter = new Twitter();

    /**
     * tweetを読み込んで表示する
     * @param kind (firstTime or olderTweets)
     */
    function loadTweets(kind) {
        indicator.show();
        updating = true;
        var loadingRowIdx = -1;
        if(table.data[0]){
            loadingRowIdx = table.data[0].rows.length - 1;
        }
        twitter.loadTweets(kind, {
            setNextPageParam: function(nextPageParam) {
                //TODO?
            }
            ,success: function(tweetList) {
                try {
                    var rows = new Array();
                    table.startLayout();
                    for(i=0; i<tweetList.length; i++) {
                        var tweet = tweetList[i];
                        // rows.push(createRow(tweet));
                        if("newerTweets" == kind) {
                            //TableViewAnimationProperties ap = {animated: false};
                            table.insertRowBefore(i, createRow(tweet), {animated: false});
                        } else {
                            table.appendRow(createRow(tweet));
                        }
                    }
                    if("firstTime" == kind) {
                        // table.setData(rows);
                        self.add(table);
                    } else if("newerTweets" == kind) {
//                        table.scrollToIndex(tweetList.length);
                    } else if("olderTweets" == kind) {
                        if(loadingRowIdx > 0) {
                            // “読み込み中”のローを削除する。
                            Ti.API.info("読み込み中ロー削除：" + loadingRowIdx);
                            table.deleteRow(loadingRowIdx);
                        }
                    }
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    table.finishLayout();
                    indicator.hide();
                    updating = false;
                }
            },
            fail: function(message) {
                updating = false;
                indicator.hide();
                var dialog = Ti.UI.createAlertDialog({
                    message: message,
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
    }
    
    /**
     * TableViewRowを生成して返す
     * @param {Object} tweet (id, userName, text, profileImgUrl, etc...)
     */
    function createRow(tweet) {
        var row = Ti.UI.createTableViewRow(style.twitter.tableViewRow);
        // プロフィール画像
        var profileImg = Ti.UI.createImageView(style.twitter.profileImg);
        profileImg.image = tweet.profileImageUrl;
        // ユーザ名ラベル
        var userNameLabel = Ti.UI.createLabel(style.twitter.userNameLabel);
        userNameLabel.text = tweet.userName;
        // 本文ラベル
        var textLabel = Ti.UI.createLabel(style.twitter.textLabel);
        textLabel.text = tweet.text;
        // 時間ラベル
        var timeLabel = Ti.UI.createLabel(style.twitter.timeLabel);
        var timeText = tweet.timeText;

        timeLabel.text = timeText;
        row.add(userNameLabel);
        row.add(profileImg);
        row.add(textLabel);
        row.add(timeLabel);
        row.tweet = tweet;
        return row;
    }

    var lastDistance = 0; // calculate location to determine direction
    // テーブルのスクロールイベント
    table.addEventListener('scroll', function(e) {
        var offset = e.contentOffset.y;
        var height = e.size.height;
        var total = offset + height;
        var theEnd = e.contentSize.height;
        var distance = theEnd - total;
    
        // going down is the only time we dynamically load,
        // going up we can safely ignore -- note here that
        // the values will be negative so we do the opposite
        if (distance < lastDistance) {
            // adjust the % of rows scrolled before we decide to start fetching
            var nearEnd = theEnd * .90;
            if (!updating && (total >= nearEnd)) {
                beginUpdate();
            }
        }
        lastDistance = distance;
    });
    
    // テーブルのクリックイベント
    table.addEventListener('click', function(e) {
        var t = e.row.tweet;
        // var tweetWin = Ti.UI.createWindow({
            // navBarHidden: false
            // ,tabBarHidden: true
            // ,barColor: 'red'
        // });

        // HTMLテンプレート
        var templateFile = Ti.Filesystem.getFile(
            Ti.Filesystem.resourcesDirectory, 'tweetTemplate.txt');
        var template = templateFile.read().toString();
        var html = util.replaceAll(template, "{profileImageUrl}", t.profileImageUrl);
        html = util.replaceAll(html, "{userName}", "@" + t.userName);
        var text = util.tweetTrimer(t.text);
        html = util.replaceAll(html, "{text}", text);
        html = util.replaceAll(html, "{timeText}", t.timeText);

        var webView = Ti.UI.createWebView({
            html: html
        });

        // ロード前のイベント
        var ind;
        webView.addEventListener('beforeload',function(e){
            if(e.navigationType != 5) {//リンク先URLのhtml中の画像やiframeの場合、5
                Ti.API.info('beforeload #################### ');
                for(i in e) {
                    Ti.API.info('   ' + i + ' = ' + e[i]);
                }
                webView.opacity = 0.8;
                Ti.API.info('インジケータshow');
                ind = Ti.UI.createActivityIndicator({color: 'red'});
                webView.add(ind);
                ind.show();
                indicator.show();//TODO
                webView.url = e.url;
            }
        }); 
        // ロード完了時にインジケータを隠す
        webView.addEventListener("load", function(e) {
            if(ind) {
                for(i in e) {
                    Ti.API.info('   ' + i + ' = ' + e[i]);
                }
                Ti.API.info('load ####################');
                Ti.API.info('インジケータhide');
                webView.opacity = 1.0;
                ind.hide();
                indicator.hide();//TODO
                ind = null;
            }
        });

        var webData = {
            html: html
        };
        var tweetWin = new WebWindow(webData);
        tweetWin.tabBarHidden = true;
        // tweetWin.add(webView);
        tabGroup.activeTab.open(tweetWin, {animated: true});
    });

    /**
     * 表示更新を開始する
     */
    function beginUpdate() {
        Ti.API.info("===== beginUpdate =====");
        updating = true;
        // 読み込み中Row
        table.appendRow(loadingRow);
        loadingInd.show();      
        loadTweets("olderTweets");
    }
    return self;
}
module.exports = TwitterWindow;
