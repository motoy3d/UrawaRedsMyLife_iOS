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
    var ConfigWindow = require("/ui/handheld/ConfigWindow");
	var util = require("util/util").util;
	var style = require("util/style").style;
	var news = new News();
    
    // 設定ボタン
    var configButton = Ti.UI.createButton({
        image: "/images/gear.png"
    });
    var configButtonClicked = false;
    configButton.addEventListener('click', function() {
        if(configButtonClicked) {return;}
        try {
            configButtonClicked = true;
            var configWindow = new ConfigWindow();
            configWindow.tabBarHidden = true;
            tabGroup.activeTab.open(configWindow, {animated: true});
        } finally{
            configButtonClicked = false;
        }
    });
    // ウィンドウ
	var self = Ti.UI.createWindow({
		title: L('news')
		,barColor: 'red'
        ,rightNavButton: configButton
	});
	// テーブル
	var table = Ti.UI.createTableView(style.news.table);
	table.allowsSelectionDuringEditing = false;

	// インジケータ
	var indicator = Ti.UI.createActivityIndicator();
	self.add(indicator);
	indicator.show();
    
    // ボーダー
    var border = Ti.UI.createView(style.news.tableBorder);
    // テーブルヘッダ
    var tableHeader = Ti.UI.createView(style.news.tableHeader);
    // fake it til ya make it..  create a 2 pixel
    // bottom border
    tableHeader.add(border);
    // 矢印
    var arrow = Ti.UI.createView(style.news.arrow);
    // ステータスラベル
    var statusLabel = Ti.UI.createLabel(style.news.statusLabel);
    // 最終更新日時ラベル
    var lastUpdatedLabel = Ti.UI.createLabel(style.news.lastUpdatedLabel);
    lastUpdatedLabel.text = "最終更新: "+util.formatDatetime();

    // インジケータ
    var refreshActInd = Titanium.UI.createActivityIndicator(style.news.refreshActIndicator);
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
        table.allowsSelection = false;
		Ti.API.debug("  サイト名＝＝＝＝＝＝＝＝＝" + e.rowData.siteName);
		visitedUrls.push(e.rowData.link);
		e.row.backgroundColor = style.news.visitedBgColor;
		news.saveVisitedUrl(e.rowData.link);
		var webData = {
			title : e.rowData.pageTitle,
			siteName : e.rowData.fullSiteName,
			link : e.rowData.link,
			content : e.rowData.content,
			image : e.rowData.image,
			pubDate : e.rowData.pubDate
		};
		var webWindow = new WebWindow(webData);
		webWindow.tabBarHidden = true;
		// navGroup.open(webWindow, {animated: true});
		tabGroup.activeTab.open(webWindow, {animated: true});
        Ti.App.Analytics.trackPageview('/newsDetail');
        table.allowsSelection = true;
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
        table.setContentInsets({top: 0},{animated: false});
        reloading = false;
        lastUpdatedLabel.text = "最終更新: "+ util.formatDatetime();
        statusLabel.text = "ひっぱって更新...";
        refreshActInd.hide();
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
            refreshActInd.show();
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
		Ti.API.debug(new Date() + '  loadFeed.................................tableView=' + table);
		//alert('loadFeed : ' + news + ", kind=" + kind);
        //alert(news.loadNewsFeed);
		news.loadNewsFeed(
		    kind, news.continuation, news.newest_item_timestamp,  
		    { //callback
    			success: function(rowsData, newest_item_timestamp) {
    				try {
    					// 読み込み中Row削除
    					loadingInd.hide();
    					
    					Ti.API.debug("rowsData■" + rowsData);
                        // 初回ロード時
    					if("firstTime" == kind) {
                            self.add(table);
                            if(rowsData) {
                                table.setData(rowsData);
                                news.newest_item_timestamp = newest_item_timestamp;
                            }
                            indicator.hide();
                            Ti.API.debug('■■■newest_item_timestamp = ' + news.newest_item_timestamp);
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
                                    Ti.API.debug("appendRow. " + i + "  " + rowsData[i].children[0].text);
                                    table.appendRow(rowsData[i]);
                                }
    						}
    						Ti.API.debug("読み込み中Row削除：" + lastRow);
    						table.deleteRow(lastRow);
    						endLoadingOlder();
    					}
                        // 最新データロード時
                        else if("newerEntries" == kind) {
                            if(rowsData) {
                                Ti.API.debug('最新データ読み込み  件数＝' + rowsData.length);
                                table.startLayout();
                                for(i=0; i<rowsData.length; i++) {
                                    Ti.API.info("insertRowBefore. " + i + "  " + rowsData[i].pubDate + "  " 
                                        + rowsData[i].pageTitle);
                                    table.insertRowBefore(i, rowsData[i]);
                                }
                                table.finishLayout();
                                if(news.newest_item_timestamp < newest_item_timestamp) {
                                    news.newest_item_timestamp = newest_item_timestamp;
                                }
                                Ti.API.debug('■newest_item_timestamp = ' + news.newest_item_timestamp);
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
    			    if("olderEntries" == kind) {
    			        endLoadingOlder();
    			    } else if("newerEntries" == kind) {
    			        endLoadingNewer();
    			    }
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
                },
                fail: function(message) {
                    Ti.API.error('NewsWindow.js  continuation取得失敗 [' + message + ']');
                    var dialog = Ti.UI.createAlertDialog({
                        message: message,
                        buttonNames: ['OK']
                    });
                    dialog.show();
                }
            });
		}
	}
	loadFeed(news, 'firstTime');	
	return self;
};
module.exports = NewsWindow;
