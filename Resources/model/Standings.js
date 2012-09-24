/**
 * 順位表取得サービス
 * Yahoo スポーツから読み込み
 */
function Standings() {
	var util = require("util/util").util;

	var self = {};
	self.load = load;
	// YQL
	var standingsQuery = "select * from html where url="
		+ "'http://soccer.yahoo.co.jp/jleague/standings/j1' "
		+ " and xpath=\"//div[@id='team_ranking']/table/tr\"";

	/**
	 * Yahooスポーツサイトのhtmlを読み込んで表示する
	 */
	function load(callback) {
		// オンラインチェック
		if(!Ti.Network.online) {
			util.openOfflineMsgDialog();
		}
		Ti.App.Analytics.trackPageview('/standings');
		var before = new Date();
		var standingBody = "";
		Ti.Yahoo.yql(standingsQuery, function(e) {
			try {
				if(e.data == null) {
					var dialog = Ti.UI.createAlertDialog({
						title: '読み込みに失敗しました',
						buttonNames: ['OK']
					});
					dialog.show();
					return;
				}
				var standingsDataList = new Array();
				Ti.API.info("e.data.tr■" + e.data.tr.length);
				var dataList = e.data.tr;			
				for(i=1; i<dataList.length; i++) {
					// タグからデータ抽出
					var tdList = dataList[i]["td"];
					var rank = tdList[0].em;
	//				var image = tdList[2].a.img.src;
					var team = util.getTeamName(tdList[3].a.content);
					var point = tdList[4].strong;
					var win = tdList[6].p;
					var draw = tdList[7].p;
					var lose = tdList[8].p;
					var gotGoal = tdList[9].p;
					var lostGoal = tdList[10].p;
					var diff = tdList[11].p;
					// var gridRow = new GridRow(gridRowClassName);
					//Ti.API.info(i + "★gridRow=" + gridRow);
					Ti.API.info(rank + ' : ' + team + ' : ' + point);
					
					var standingsData = {
					    rank: rank
					    ,team: team
					    ,point: point
					    ,win: win
					    ,draw: draw
					    ,lose: lose
					    ,gotGoal: gotGoal
					    ,lostGoal: lostGoal
					    ,diff: diff
					};
					standingsDataList.push(standingsData);
				}
				callback.success(standingsDataList);
				Ti.API.info('+++++++++++++++++++ YQL終了')
			} catch(ex) {
				Ti.API.error('---------------------\n' + ex);	
			} finally {
			}
			var after = new Date();
			Ti.API.info("Standings.js#load() 処理時間★" 
				+ (after.getTime()-before.getTime())/1000.0 + "秒");
		});
	}
	return self;
}
module.exports = Standings;
