/**
 * Twitter画面UI
 */
function TwitterWindow(tabGroup) {
	var Twitter = require("model/Twitter");
	var util = require("util/util").util;
	var style = require("util/style").style;
    var updating = false;
    var loadingRow = Ti.UI.createTableViewRow(style.twitter.loadingRow);
    var loadingInd = Ti.UI.createActivityIndicator(style.twitter.loadingIndicator);
    loadingInd.message = style.common.loadingMsg;
    loadingRow.add(loadingInd);

    // ウィンドウ
	var self = Ti.UI.createWindow({
		navBarHidden: true
		,backgroundColor: 'black'
	});
	
	// インジケータ
	var indicator = Ti.UI.createActivityIndicator();
	self.add(indicator);
	
	//openイベント
	self.addEventListener('open', function(e) {
		loadTweets("firstTime");
	});
    
    // テーブル
    var table = Ti.UI.createTableView({
        allowsSelection: true
        ,separatorColor: '#666'
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
		        
		    }
			,success: function(tweetList) {
				try {
				    var rows = new Array();
				    for(i=0; i<tweetList.length; i++) {
				        var tweet = tweetList[i];
				        // rows.push(createRow(tweet));
				        table.appendRow(createRow(tweet));
				    }
				    if("firstTime" == kind) {
                        // table.setData(rows);
                        self.add(table);
				    } else {
                        if(loadingRowIdx > 0) {
                            // “読み込み中”のローを削除する。
                            Ti.API.info("読み込み中ロー削除：" + loadingRowIdx);
                            table.deleteRow(loadingRowIdx);
                        }
				    }
				} catch(e) {
					Ti.API.error(e);
				} finally {
					indicator.hide();
					updating = false;
				}
			},
			fail: function() {
				indicator.hide();
                updating = false;
				var dialog = Ti.UI.createAlertDialog({
					title: style.loadingFailMsg,
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
        timeLabel.text = util.parseDate2(tweet.createDatetime),
        row.add(userNameLabel);
        row.add(profileImg);
        row.add(textLabel);
        row.add(timeLabel);
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
// 
    // // テーブルに対するスクロールイベントハンドラを追加。
    // table.addEventListener('scroll', function(e) {
        // if(!table.data[0]) {
            // return;
        // }
        // // 更新中じゃなく，テーブルのサイズの最後の２件以上までスクロールしたら。
        // if(!updating) {
            // if(e.visibleItemCount + e.firstVisibleItem > table.data[0].rows.length-2) {
                // if(!updating) { //念のため再度チェック
                    // Ti.API.info("-----アップデート開始:" + (new Date()).getTime());
                    // beginUpdate();
                // }
            // }
        // }
    // });
	return self;
}
module.exports = TwitterWindow;
