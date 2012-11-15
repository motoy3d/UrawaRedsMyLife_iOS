/**
 * 日程・結果画面UI
 */
function ResultsWindow(tabGroup) {
	var Results = require("model/Results");
	var WebWindow = require("ui/handheld/WebWindow");
	var YoutubeWindow = require("ui/handheld/YoutubeWindow");
	var util = require("util/util").util;
	var style = require("util/style").style;

	var self = Ti.UI.createWindow({
		title: '日程・結果',
		backgroundColor:'black'
		,barColor: 'red'
	});
	self.loadDetailHtml = loadDetailHtml;	//function
	self.searchMovie = searchMovie;	//function
	
	// インジケータ
    var indicator = Ti.UI.createActivityIndicator();
	self.add(indicator);

	// テーブル
	var tableView = Ti.UI.createTableView({
		backgroundColor:'black'
	});
	
	var results = new Results(self);

	/**
	 * 浦和公式サイトの試合日程htmlを読み込んで表示する
	 */
	function loadResults() {
        Ti.API.info(">>>>>>>>> loadResults start");
		indicator.show();
		// オンラインチェック
		if(!Ti.Network.online) {
			indicator.hide();
			util.openOfflineMsgDialog();
			return;
		}
		Ti.API.info(">>>>>>>>> results=" + results);
		results.load({
			/* 成功時処理 */
			success: function(rowsData) {
				try {
				    var rowIdx = 0;
				    for(i=1; i<rowsData.length; i++) {
				        if(rowsData[i].detailUrl) {
				            rowIdx = i-1;   //最初の１行目は除くため-1
				        } else {
				            break;
				        }
				    }
				    Ti.API.info('---- add tableView');
					self.add(tableView);
					tableView.setData(rowsData.slice(1));                    Ti.API.info('---- setData OK');
                    Ti.API.info('rowIdx=' + rowIdx);
                    tableView.scrollToIndex(rowIdx);
				} catch(e) {
				    Ti.API.debug("エラー");
					Ti.API.error(e);
				} finally {
				    Ti.API.debug("インジケータ hide");
					indicator.hide();
				}
			},
			/* 失敗時処理 */
            fail: function(message) {
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
	 * 試合詳細ページをWebViewで表示する (Results.jsから呼ぶ)
	 */
	function loadDetailHtml(detailUrl) {
		Ti.API.info("loadDetailHtml----------");
		var webData = {
			title : "試合詳細",
			link : detailUrl
		};
		var webWindow = new WebWindow(webData);
		tabGroup.activeTab.open(webWindow, {animated: true});
	}

	/**
	 * 動画検索結果を表示する (Results.jsから呼ぶ)
	 */
	function searchMovie(searchCond) {
		Ti.API.info("searchMovie----------k1 =  " + searchCond.key1 + "¥n k2 =  " + searchCond.key2);
		var youtubeWindow = new YoutubeWindow(searchCond);
		//youtubeWindow.doYoutubeSearch(searchCond.key1, searchCond.key2);
		youtubeWindow.searchYoutube(searchCond.key1, searchCond.key2);
		tabGroup.activeTab.open(youtubeWindow, {animated: true});
	}
	// window openイベント
	self.addEventListener('open', function(){
		loadResults();
	});
	return self;
}
module.exports = ResultsWindow;
