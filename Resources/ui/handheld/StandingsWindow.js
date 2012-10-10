/**
 * 順位表画面UI
 */
function StandingsWindow(tabGroup) {
	var Standings = require("model/Standings");
	// var util = require("util/util").util;
	// var style = require("util/style").style;

	var self = Ti.UI.createWindow({
		title: L('standings'),
		backgroundColor: 'black'
		,barColor: 'red'
	});
		
	//openイベント
	self.addEventListener('open', function(e) {
		loadStandings();
	});
    var head = Ti.UI.createView({
        backgroundColor: 'black'
    });
    
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
    head.add(rankHeader);
    head.add(teamHeader);
    head.add(pointHeader);
    head.add(winHeader);
    head.add(drawHeader);
    head.add(loseHeader);
    head.add(gotGoalHeader);
    head.add(lostGoalHeader);
    head.add(diffGoalHeader);
    self.add(head);

    // ボーダー
    var border = Ti.UI.createLabel({
        width: Ti.UI.FILL,
        height: 1,
        top: 34
        ,borderWidth: 1
        ,borderColor: '#999'
    });
    self.add(border);
    
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator();
    self.add(indicator);
    
    var platformHeight = Ti.Platform.displayCaps.platformHeight;
    Ti.API.debug('platformHeight=' + platformHeight);
    // 順位表ボディ部
    // var body = Ti.UI.createScrollView({
       // contentWidth: 'auto',
        // contentHeight: 'auto',
        // showVerticalScrollIndicator: true,
      // // top: 50,
      // height: platformHeight-37,
      // width: Ti.UI.FILL
    // });
    // Create a TableView.
    var table = Ti.UI.createTableView({
        top: 37
        ,allowsSelection: false
        ,separatorColor: '#666'
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
        var headerStyle = {
            text: name,
            height: 33,
            top : 1,
            left : left,
            backgroundColor: 'black',
            color: 'white'
        };
        return Ti.UI.createLabel(headerStyle);
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
        var row = Ti.UI.createTableViewRow({
            height: 28
            ,color: 'white'
            ,backgroundColor: 'black'
        });
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
