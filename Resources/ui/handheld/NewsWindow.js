/**
 * ニュース画面UI
 * loadFeed フィードを読み込む
 * beginLoadingOlder 追加ロードを開始する
 * endLoadingOlder 追加ロード終了時処理
 * beginLoadingNewer 最新ロードを開始する
 * endLoadingNewer 最新ロード終了時処理
 */
function NewsWindow(tabGroup) {
	var News = require("model/News");
	var WebWindow = require("ui/handheld/WebWindow");
	var util = require("util/util").util;
	var style = require("util/style").style;
	var news = new News();
    
    // 更新ボタン
    var refreshButton = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.REFRESH
    });
    // ウィンドウ
	var self = Ti.UI.createWindow({
		title: L('news')
		,barColor: 'red'
		,rightNavButton: refreshButton
	});
	// テーブル
	var table = Ti.UI.createTableView(style.news.table);
	
	// インジケータ
	var indicator = Ti.UI.createActivityIndicator();
	self.add(indicator);
	indicator.show();
    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        news = new News();
        self.remove(table);
        self.add(indicator);
        indicator.show();
        loadFeed(news, 'firstTime');
        table.scrollToTop();
    });
    
    // ボーダー
    var border = Ti.UI.createView({
        backgroundColor:"#576c89",
        height:2,
        bottom:0
    });
    // テーブルヘッダ
    var tableHeader = Ti.UI.createView({
        backgroundColor: "black",
        width:320,
        height:60
    });
    // fake it til ya make it..  create a 2 pixel
    // bottom border
    tableHeader.add(border);
    // 矢印
    var arrow = Ti.UI.createView({
        backgroundImage:"/images/whiteArrow.png",
        width:23,
        height:60,
        bottom:10,
        left:20
    });
    // ステータスラベル
    var statusLabel = Ti.UI.createLabel({
        text:"ひっぱって更新",
        left:55,
        width:200,
        bottom:30,
        height: Ti.UI.FILL,
        color:"#576c89",
        textAlign:"center",
        font:{fontSize:13,fontWeight:"bold"},
        shadowColor:"#999",
        shadowOffset:{x:0,y:1}
    });
    // 最終更新日時ラベル
    var lastUpdatedLabel = Ti.UI.createLabel({
        text: "最終更新: "+util.formatDatetime(),
        left: 55,
        width:200,
        bottom:15,
        height:"auto",
        color:"#576c89",
        textAlign:"center",
        font:{fontSize:12},
        shadowColor:"#999",
        shadowOffset:{x:0,y:1}
    });
    // インジケータ
    var actInd = Titanium.UI.createActivityIndicator({
        left:20,
        bottom:13,
        width:30,
        height:30
    });
    // テーブルヘッダに矢印、ステータス、最終更新日時、インジケータを追加し、
    // テーブルにヘッダをセット
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(actInd);
    table.headerPullView = tableHeader;
    // フラグ
    var pulling = false;
    var reloading = false;
    
	
	// 読み込み中Row+indicator
	var updating = false;
	var loadingRow = Ti.UI.createTableViewRow();
	var loadingInd = Ti.UI.createActivityIndicator({
		color: 'white'
		,message: style.common.loadingMsg
		,width: Ti.UI.FILL
		,height: 50
	});
	loadingRow.add(loadingInd);
	
	var lastRow = news.loadFeedSize;
	var visitedUrls = new Array();
	// ニュース選択時のアクション
	table.addEventListener("click", function(e) {
		Ti.API.debug("  サイト名＝＝＝＝＝＝＝＝＝" + e.rowData.siteName);
		visitedUrls.push(e.rowData.link);
		e.row.backgroundColor = style.news.visitedBgColor;
		news.saveVisitedUrl(e.rowData.link);
		var webData = {
			title : e.rowData.pageTitle,
			siteName : e.rowData.fullSiteName,
			link : e.rowData.link,
			content : e.rowData.content,
			pubDate : e.rowData.pubDate
		};
		var webWindow = new WebWindow(webData);
		// navGroup.open(webWindow, {animated: true});
		tabGroup.activeTab.open(webWindow, {animated: true});
        Ti.App.Analytics.trackPageview('/newsDetail');
	});

	/**
	 * 追加ロードを開始する(古いデータを読み込む)
	 */
	function beginLoadingOlder() {
		Ti.API.info("===== beginLoadingOlder =====");
		updating = true;
		// 読み込み中Row
		table.appendRow(loadingRow);
		loadingInd.show();
		loadFeed(news, 'olderEntries');
	}	
	/**
	 * 追加ロード終了時処理。ローディングRowの削除、スクロール
	 */
	function endLoadingOlder() {
		updating = false;
		Ti.API.info(" endLoadingOlder. lastRow=" + lastRow + ", table.size=" + table.data[0].length);
	}
    /**
     * 最新ロードを開始する(新しいデータを読み込む)
     */
    function beginLoadingNewer() {
        Ti.API.info("===== beginLoadingNewer =====");
        loadFeed(news, 'newerEntries');
    }
    /**
     * 最新ロード終了時処理。
     */
    function endLoadingNewer() {
        Ti.API.debug('====== endLoadingNewer =======');
        // when you're done, just reset
        table.setContentInsets({top:0},{animated:true});
        reloading = false;
        lastUpdatedLabel.text = "最終更新: "+ util.formatDatetime();
        statusLabel.text = "ひっぱって更新...";
        actInd.hide();
        arrow.show();
    }
    	
	var lastDistance = 0; // calculate location to determine direction
	// テーブルのスクロールイベント
	table.addEventListener('scroll',function(e) {
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
				beginLoadingOlder();
			}
		}
        // pull to refresh
        else if (offset <= -65.0 && !pulling && !reloading) {
            var t = Ti.UI.create2DMatrix();
            t = t.rotate(-180);
            pulling = true;
            arrow.animate({transform: t, duration: 180});
            statusLabel.text = "ひっぱって更新...";
        }
        else if (pulling && (offset > -65.0 && offset < 0) && !reloading ) {
            pulling = false;
            var t = Ti.UI.create2DMatrix();
            arrow.animate({transform:t,duration:180});
            statusLabel.text = "ひっぱって更新...";
        }
		lastDistance = distance;
	});
    
    // ドラッグ終了イベント（pull to refresh）
    var event1 = 'dragEnd';
    if (Ti.version >= '3.0.0') {
        event1 = 'dragend';
    }
    table.addEventListener(event1,function(e) {
        if (pulling && !reloading) {
            reloading = true;
            pulling = false;
            arrow.hide();
            actInd.show();
            statusLabel.text = "読み込み中...";
            table.setContentInsets({top:60},{animated:true});
            arrow.transform=Ti.UI.create2DMatrix();
            beginLoadingNewer();
        }
    });
    
	/**
	 * フィードを取得して表示する
	 */
	function loadFeed(news, kind) {
		var style = require("util/style").style;
		Ti.API.info(new Date() + '  loadFeed.................................tableView=' + table);
		//alert('loadFeed : ' + news + ", kind=" + kind);
        //alert(news.loadNewsFeed);
		news.loadNewsFeed(
		    kind, news.continuation, news.newest_item_timestamp,  
		    { //callback
    			success: function(rowsData, newest_item_timestamp) {
    				try {
    					// 読み込み中Row削除
    					loadingInd.hide();
    					
    					Ti.API.info("rowsData■" + rowsData);
                        // 初回ロード時
    					if("firstTime" == kind) {
                            self.add(table);
                            if(rowsData) {
                                table.setData(rowsData);
                                news.newest_item_timestamp = newest_item_timestamp;
                            }
                            indicator.hide();
                            Ti.API.info('■■■newest_item_timestamp = ' + news.newest_item_timestamp);
    					}
    					// 2回目以降の追加ロード時
    					else if("olderEntries" == kind) {
                            lastRow = table.data[0].rows.length - 1;
    						var scrollToIdx = table.data[0].rows.length;
    						if(rowsData) {
                                for(i=0; i<rowsData.length; i++) {
                                    if(i == 0) {
                                        //indWin.close();
                                    }
                                    Ti.API.info("appendRow. " + i + "  " + rowsData[i].children[0].text);
                                    table.appendRow(rowsData[i]);
                                }
    						}
    						Ti.API.info("読み込み中Row削除：" + lastRow);
    						table.deleteRow(lastRow);
    						endLoadingOlder();
    					}
                        // 最新データロード時
                        else if("newerEntries" == kind) {
                            if(rowsData) {
                                Ti.API.info('最新データ読み込み  件数＝' + rowsData.length);
                                for(i=0; i<rowsData.length; i++) {
                                    //Ti.API.info("appendRow. " + i + "  " + rowsData[i].children[0].text);
                                    table.insertRowBefore(0, rowsData[i]);
                                }
                                news.newest_item_timestamp = rowsData[0].newest_item_timestamp;
                                Ti.API.info('■newest_item_timestamp = ' + news.newest_item_timestamp);
                            }
                            endLoadingNewer();
    					}
    					else {
    					    Ti.API.error('NewsWindow#loadFeedに渡すkindが不正です。kind=' + kind);
    					}
    				} finally {
    					// ind.hide();
    					//indWin.close();
    				}
    			},
    			fail: function(message) {
    			    indicator.hide();
    				var dialog = Ti.UI.createAlertDialog({
    					message: message,
    					buttonNames: ['OK']
    				});
    				dialog.show();
    			}
    		}
		);
		if('firstTime' == kind || 'olderEntries' == kind) {
            // continuation取得
            news.getContinuation(news.continuation, {
                success: function(continuation) {
                    news.continuation = continuation;
                }
            });
		}
	}
	loadFeed(news, 'firstTime');	
	return self;
};
module.exports = NewsWindow;
