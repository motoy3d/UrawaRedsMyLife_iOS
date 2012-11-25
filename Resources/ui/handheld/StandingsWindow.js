/**
 * 順位表画面UI
 */
function StandingsWindow(tabGroup) {
	var Standings = require("model/Standings");
	// var util = require("util/util").util;
	var style = require("util/style").style;

    // 更新ボタン
    var refreshButton = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.REFRESH
    });
	var self = Ti.UI.createWindow({
		title: L('standings'),
		backgroundColor: 'black'
		,barColor: 'red'
        ,rightNavButton: refreshButton
	});
		
	//openイベント
	self.addEventListener('open', function(e) {
		loadStandings();
	});
    var headerView = Ti.UI.createView(style.standings.headerView);
    
    // ヘッダー
    var rankHeader = createHeaderLabel('位', 5);
    var teamHeader = createHeaderLabel('チーム', 30);
    var leftPos = 100;
    var w = 33;
    var pointHeader = createHeaderLabel('点', leftPos);
    var winHeader = createHeaderLabel('勝', leftPos+(w*1));
    var drawHeader = createHeaderLabel('分', leftPos+(w*2));
    var loseHeader = createHeaderLabel('負', leftPos+(w*3));
    var gotGoalHeader = createHeaderLabel('得', leftPos+(w*4));
    var lostGoalHeader = createHeaderLabel('失', leftPos+(w*5));
    var diffGoalHeader = createHeaderLabel('差', leftPos+(w*6));
    headerView.add(rankHeader);
    headerView.add(teamHeader);
    headerView.add(pointHeader);
    headerView.add(winHeader);
    headerView.add(drawHeader);
    headerView.add(loseHeader);
    headerView.add(gotGoalHeader);
    headerView.add(lostGoalHeader);
    headerView.add(diffGoalHeader);
    self.add(headerView);

    // ボーダー
    var border = Ti.UI.createLabel(style.standings.border);
    self.add(border);
    
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator();
    self.add(indicator);
    
    var platformHeight = Ti.Platform.displayCaps.platformHeight;
    Ti.API.debug('platformHeight=' + platformHeight);
    var table = Ti.UI.createTableView(style.standings.table);

    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        self.remove(table);
        indicator.show();
        loadStandings();
    });

	/**
	 * Yahooスポーツサイトのhtmlを読み込んで表示する
	 */
	function loadStandings() {
		indicator.show();
		var standings = new Standings();
		standings.load({
			success: function(standingsDataList) {
				try {
				    var rows = new Array();
				    for(i=0; i<standingsDataList.length; i++) {
				        var data = standingsDataList[i];
				        rows.push(createRow(
				            data.rank, data.team, data.point, data.win, data.draw, data.lose
				            , data.gotGoal, data.lostGoal, data.diff)
				        );
				    }
				    table.setData(rows);
				    self.add(table);
				} catch(e) {
					Ti.API.error(e);
				} finally {
					indicator.hide();
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
	}
    /**
     * ヘッダーラベルを生成して返す
     */
    function createHeaderLabel(name, left) {
        var label = Ti.UI.createLabel(style.standings.headerLabel);
        label.text = name;
        label.left = left;
        return label;
    }
    
    /**
     * TableViewRowを生成して返す
     * @param {Object} rank
     * @param {Object} team
     * @param {Object} point
     * @param {Object} win
     * @param {Object} draw
     * @param {Object} lose
     * @param {Object} gotGoal
     * @param {Object} lostGoal
     * @param {Object} diff
     */
    function createRow(rank, team, point, win, draw, lose, gotGoal, lostGoal, diffGoal) {
        var row = Ti.UI.createTableViewRow(style.standings.tableViewRow);
        // 順位
        var rankLabel = createRowLabel(rank, 5, 20, 'center');
        row.add(rankLabel);
        // チーム
        var teamLabel = createRowLabel(team, 30, 60, 'left');
        row.add(teamLabel);
        var leftPos = 93;
        var w = 33;
        // 勝点
        var pointLabel = createRowLabel(point, leftPos, 26);
        row.add(pointLabel);
        // 勝
        var winLabel = createRowLabel(win, leftPos+(w*1), 26);
        row.add(winLabel);
        // 分
        var drawLabel = createRowLabel(draw, leftPos+(w*2), 26);
        row.add(drawLabel);
        // 負
        var loseLabel = createRowLabel(lose, leftPos+(w*3), 26);
        row.add(loseLabel);
        // 得
        var gotGoalLabel = createRowLabel(gotGoal, leftPos+(w*4), 26);
        row.add(gotGoalLabel);
        // 失
        var lostGoalLabel = createRowLabel(lostGoal, leftPos+(w*5), 26);
        row.add(lostGoalLabel);
        // 差
        var diffGoalLabel = createRowLabel(diffGoal, leftPos+(w*6), 26);
        row.add(diffGoalLabel);
        // 浦和背景色
        if('浦和' == team) {
            row.backgroundColor = 'red';
        }
        return row;
    }
    
    /**
     * TableViewRowに乗せるラベルを生成して返す
     * @param {Object} text
     * @param {Object} left
     * @param {Object} width
     */
    function createRowLabel(text, left, width, textAlign) {
        if(!textAlign) {
            textAlign = 'right';
        }
        var label = Ti.UI.createLabel({
            text: text
            ,textAlign: textAlign
            ,left: left
            ,width: width
            ,color: 'white'
        });
        return label;
    }
	return self;
}
module.exports = StandingsWindow;
