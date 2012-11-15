/**
 * ニュース画面UI
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

    refreshButton.addEventListener('click', function(e){
        news = new News();
        self.remove(table);
        self.add(indicator);
        indicator.show();
        loadFeed(news);
        table.scrollToTop();
    });
	
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
	 * 表示更新を開始する
	 */
	function beginUpdate() {
		Ti.API.info("===== beginUpdate =====");
		updating = true;
		// 読み込み中Row
		table.appendRow(loadingRow);
		loadingInd.show();		
		loadFeed(news, true);
	}
	
	/**
	 * 表示更新終了時処理。ローディングRowの削除、スクロール
	 */
	function endUpdate() {
		updating = false;
		Ti.API.info(" endUpdate. lastRow=" + lastRow + ", table.size=" + table.data[0].length);
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
				beginUpdate();
			}
		}
		lastDistance = distance;
	});

	/**
	 * フィードを取得して表示する
	 */
	function loadFeed(news, isUpdate) {
		var style = require("util/style").style;
		Ti.API.info(new Date() + '  loadFeed.................................tableView=' + table);
		// alert('loadFeed');
		news.loadNewsFeed(news.continuation, {
			success: function(rowsData) {
				try {
					// 読み込み中Row削除
					loadingInd.hide();
					
					Ti.API.info("rowsData■" + rowsData);
					// 2回目以降の追加ロード時
					if(isUpdate) {
                        lastRow = table.data[0].rows.length - 1;
						var scrollToIdx = table.data[0].rows.length;
						for(i=0; i<rowsData.length; i++) {
							if(i == 0) {
								//indWin.close();
							}
							Ti.API.info("appendRow. " + i + "  " + rowsData[i].children[0].text);
							table.appendRow(rowsData[i]);
						}
						Ti.API.info("読み込み中Row削除：" + lastRow);
						table.deleteRow(lastRow,
							{/*animationStyle:Titanium.UI.iPhone.RowAnimationStyle.NONE*/});
							
						endUpdate();
					} else {
						// 初回ロード時
						self.add(table);
						table.setData(rowsData);
						indicator.hide();
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
		});
		// continuation取得
		news.getContinuation(news.continuation, {
			success: function(continuation) {
				news.continuation = continuation;
			}
		});
	}
	loadFeed(news);	
	return self;
};
module.exports = NewsWindow;
