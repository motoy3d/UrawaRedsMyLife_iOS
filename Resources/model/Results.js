/**
 * 試合日程・結果データ取得サービス 
 */
function Results(resultsWindow) {
	var util = require("util/util").util;
	var style = require("util/style").style;
//	alert("resultsWindow=" + resultsWindow);
	// var ResultsWindow = require("ui/handheld/ResultsWindow");
	var self = {};
	self.load = load;
//	self.createRow = createRow;
	
	// YQLクエリ(浦和公式サイトから取得)
	var resultsQuery = "SELECT * FROM html WHERE url='http://www.urawa-reds.co.jp/game/' "
		+ "and xpath=\"//div[@class='mainContentColumn']/table/tr\"";
	var urawaEncoded = encodeURIComponent('浦和');
	var digestEncoded = encodeURIComponent('ダイジェスト');

	/**
	 * 浦和公式サイトの試合日程htmlを読み込む
	 */
	function load(callback) {
        Ti.API.info('---------------------------------------------------------------------');
        Ti.API.info(util.formatDatetime() + '  日程・結果読み込み');
        Ti.API.info('---------------------------------------------------------------------');
        // オンラインチェック
        if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
        }
        Ti.App.Analytics.trackPageview('/results');
		var before = new Date();
		var currentSeason = util.getCurrentSeason();
		Ti.API.debug("シーズン＝" + currentSeason);
			
		Ti.API.info("★★★YQL " + resultsQuery);
		Ti.Yahoo.yql(resultsQuery, function(e) {
			try {
				if(e.data == null) {
					Ti.API.error("e.data == null");
					callback.fail(style.common.loadingFailMsg);
					return;
				}
	//			Ti.API.debug("e.data.tr■" + e.data.tr);
				var rowsData = e.data.tr.map(
					function(item) {
						var row = createRow(item, currentSeason);
						if(row != null) {
						  return row;
						}
					}
				);
				//Ti.API.debug('---------rowsData=' + rowsData.length);
				callback.success(rowsData);
			} catch(ex) {
				Ti.API.info('エラー：' + ex);
				callback.fail(style.common.loadingFailMsg);
			} finally {
				var after = new Date();
				Ti.API.info("Results.js#load() 処理時間★" 
					+ (after.getTime()-before.getTime())/1000.0 + "秒");
			}
		});
	}

	/**
	 * TableViewRowを生成する
	 */
	function createRow(item, currentSeason) {
		var tdList = item["td"];
		var compe = "未定";
		if("大会/節" == compe) {
			return null;
		}
		if(tdList[0] && tdList[0].p) {
		    if(tdList[0].p.content) {
                compe = util.removeLineBreak(tdList[0].p.content);
		    } else {
                compe = util.removeLineBreak(tdList[0].p);
		    }
		}
	//Ti.API.debug('compe=' + compe);
		var date = tdList[1].p;
		if(date.content) {
		    date = util.removeLineBreak(util.replaceAll(date.content, "<br/>", ""));
		}
		Ti.API.debug('■' + date);
		var time = "";
		var team = "未定";
        if(tdList[2] && tdList[2].p) {
            time = tdList[2].p;
        }
		if(tdList[3] && tdList[3].p) {
			team = tdList[3].p;
		}
		var stadium = "";
		if(tdList[4] && tdList[4].p) {
		    stadium = tdList[4].p.content;
		}
		if(stadium) {
			var idx = stadium.indexOf("\n");
			if(idx != -1){
				stadium = stadium.substring(0, idx);
			}
		}
		var score = "";
		var resultImage = "";
		var detailUrl = "";
		// var resultColor = "black";
		if(tdList[5].a) {
			score = tdList[5].a.content;
			detailUrl = tdList[5].a.href;
		}
		if(tdList[5].font) {
			result = tdList[5].font.content;
			resultImage = "images/lose.png";
			if("#ffffff" == tdList[5].font.color) {
				if("●" == result) {
					resultImage = "images/win.png";
				} else {
					resultImage = "images/draw.png";
				}
			}
		}
		var hasDetailResult = detailUrl != "";
		Ti.API.debug(compe + " " + date + " " + time + " " + team + " " + stadium + " " + score);
		// Ti.API.debug("hasDetailResult=" + hasDetailResult);
		var row = Ti.UI.createTableViewRow(style.results.tableViewRow);
		row.detailUrl = detailUrl;
		// 日付ラベル
		var dateLabel = Ti.UI.createLabel(style.results.dateLabel);
		dateLabel.text = date + " " + time;
		row.add(dateLabel);
		// 大会ラベル
		var compeLabel = Ti.UI.createLabel(style.results.compeLabel);
		compeLabel.text = compe;
		row.add(compeLabel);
		// 会場ラベル
		var stadiumLabel = Ti.UI.createLabel(style.results.stadiumLabel);
		stadiumLabel.text = stadium;
		row.add(stadiumLabel);
		// 対戦相手チームラベル
		var teamLabel = Ti.UI.createLabel(style.results.teamLabel);
		var teamName = 'vs ' + team;
		if(team == "" || teamName == 'vs [object Object]') {
			teamName = 'vs 未定';
		}
		teamLabel.text = teamName;
		row.add(teamLabel);
		// 結果ラベル
		var resultLabel = Ti.UI.createImageView(style.results.resultLabel);
		if(resultImage != "") {
			resultLabel.image = resultImage;
		}
	
		row.add(resultLabel);
		// スコアラベル
		var scoreLabel = Ti.UI.createLabel(style.results.scoreLabel);
		if(score != "") {
		    scoreLabel.text = score;
		}
		row.add(scoreLabel);
	
		// 詳細リンクボタン
		var detailButton = Ti.UI.createButton(style.results.detailButton);
		detailButton.setEnabled(hasDetailResult);
		// 試合詳細ウィンドウを開くイベント
		detailButton.addEventListener('click', function() {
			resultsWindow.loadDetailHtml(detailUrl);
		});
		row.add(detailButton);
		// 動画リンクボタン
		var movieButton = Ti.UI.createButton(style.results.movieButton);
        movieButton.setEnabled(hasDetailResult);
		// 試合動画ウィンドウを開くイベント
		movieButton.addEventListener('click', function() {
		    Ti.API.debug('>>>>>>>>>>> date=' + date);
		    var idx = date.indexOf(' ');
		    if(idx == -1) {
		        idx = date.indexOf('(');
		    }
			var monthDate = date.substring(0, idx).split('/');
			var month = monthDate[0];
			if(month.length == 1) {
				month = '0' + month;
			}
			var day = monthDate[1];
			if(day.length == 1) {
				day = '0' + day;
			}
			// 動画検索キーワード作成
			var dateYYMMDD = String(currentSeason).substring(2) + month + day;
			var dateYYYYMMDD = encodeURIComponent(currentSeason + "年" + month + "月" + day + "日");
			var teamEncoded = encodeURIComponent(team);
			var keyword1 = currentSeason + "." + month + "." + day + '+' + urawaEncoded + '+' + teamEncoded /*+ encodeURIComponent("戦")*/;
			var keyword2 = dateYYYYMMDD + '+' + urawaEncoded + '+' + teamEncoded + '+' + digestEncoded;
			Ti.API.debug("キーワード：" + keyword1 + "  :  " + keyword2);
			// ResultsWindow側の処理を呼び出す
			resultsWindow.searchMovie({
				title: compe + "(" + date + ") " + team,
				key1: keyword1,
				key2: keyword2
			});
		});
		row.add(movieButton);
		//Ti.API.debug('row====' + row);
		return row;
	}
	return self;	
}

module.exports = Results;