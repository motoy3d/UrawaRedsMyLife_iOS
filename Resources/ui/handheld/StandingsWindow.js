/**
 * 順位表画面UI
 */
function StandingsWindow(tabGroup) {
	var Standings = require("/model/Standings");
    var ACLStandings = require("/model/ACLStandings");
	// var util = require("util/util").util;
	var style = require("/util/style").style;
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
		loadJ1Standings();
	});
    //大会
    var currentCompeIdx = 0;    //0:J1、1:ACL、2:ナビスコ
    var compeView = Ti.UI.createView(style.standings.compeView);
    var flexSpace = Ti.UI.createButton({
       systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    //ツールバー
    var compeButtonBar = Ti.UI.createButtonBar({
        style: Ti.UI.iPhone.SystemButtonStyle.BAR
        ,labels: [{title: 'J1', enabled: false}, {title: 'ACL', enabled: true}]
        ,backgroundColor: 'red'
        ,width: 200
    });
    compeButtonBar.addEventListener("click", function(e){
        if(currentCompeIdx != e.index) {
            currentCompeIdx = e.index;
            if(e.index == 0) {
                compeButtonBar.setIndex(0);
                loadJ1Standings();
            }
            else if(e.index == 1) {
                compeButtonBar.setIndex(1);
                loadACLStandings();
            }
        }
    });
//    self.setRightNavButton(compeButtonBar);
    self.setToolbar([flexSpace, compeButtonBar, flexSpace]);
    
    //J1ビュー
    var j1View = Ti.UI.createView(style.standings.standingsView);
    self.add(j1View);
    //ACLビュー
    var aclView;
    // ヘッダー
    var j1HeaderView;
    var aclHeaderView;

    // テーブル    
    var table;
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator();
    self.add(indicator);

    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        self.remove(table);
        indicator.show();
        if(currentCompeIdx == 0) {
            loadJ1Standings();
        } else if(currentCompeIdx == 1){
            loadACLStandings();
        }
    });

    /**
     * ヘッダービューを生成する 
     */
    function createHeaderView(aclFlg) {
        var headerView1 = Ti.UI.createView(style.standings.headerView);    
        var rankHeader = createHeaderLabel('位', 5);
        var teamHeader = createHeaderLabel('チーム', 30);
        var leftPos = 100;
        var w = 33;
        if(aclFlg) {
            leftPos += 30;
            w = 28;
        }
        var pointHeader = createHeaderLabel('点', leftPos);
        var winHeader = createHeaderLabel('勝', leftPos+(w*1));
        var drawHeader = createHeaderLabel('分', leftPos+(w*2));
        var loseHeader = createHeaderLabel('負', leftPos+(w*3));
        var gotGoalHeader = createHeaderLabel('得', leftPos+(w*4));
        var lostGoalHeader = createHeaderLabel('失', leftPos+(w*5));
        var diffGoalHeader = createHeaderLabel('差', leftPos+(w*6));
        headerView1.add(rankHeader);
        headerView1.add(teamHeader);
        headerView1.add(pointHeader);
        headerView1.add(winHeader);
        headerView1.add(drawHeader);
        headerView1.add(loseHeader);
        headerView1.add(gotGoalHeader);
        headerView1.add(lostGoalHeader);
        headerView1.add(diffGoalHeader);
        return headerView1;
    }
    
	/**
	 * Yahooスポーツサイトのhtmlを読み込んで表示する
	 */
	function loadJ1Standings() {
        indicator.show();
        self.title = "J1順位表";
        compeButtonBar.setLabels([{title: 'J1', enabled: false}, {title: 'ACL', enabled: true}]);
		//ヘッダー
		if(aclHeaderView) {
		    j1View.remove(aclHeaderView);
		}
        j1HeaderView = createHeaderView(false);
        j1View.add(j1HeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        j1View.add(border);
        
		var standings = new Standings();
		standings.load({
			success: function(standingsDataList) {
				try {
				    var rows = new Array();
				    for(i=0; i<standingsDataList.length; i++) {
				        var data = standingsDataList[i];
				        rows.push(createRow(
				            data.rank, data.team, data.point, data.win, data.draw, data.lose
				            , data.gotGoal, data.lostGoal, data.diff, false)
				        );
				    }
                    table = Ti.UI.createTableView(style.standings.table);
				    table.setData(rows);
				    j1View.add(table);
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
     * YahooスポーツサイトのACLのhtmlを読み込んで表示する
     */
    function loadACLStandings() {
        indicator.show();
        self.title = "ACL順位表";
        compeButtonBar.setLabels([{title: 'J1', enabled: true}, {title: 'ACL', enabled: false}]);
        // ヘッダー
        if(j1HeaderView) {
            j1View.remove(j1HeaderView);
        }
        var aclHeaderView = createHeaderView(true);
        j1View.add(aclHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        j1View.add(border);

        var standings = new ACLStandings();
        standings.load({
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        rows.push(createRow(
                            data.rank, data.team, data.point, data.win, data.draw, data.lose
                            , data.gotGoal, data.lostGoal, data.diff, true)
                        );
                    }
                    table = Ti.UI.createTableView(style.standings.table);
                    table.height = 120;
                    table.setData(rows);
                    j1View.add(table);
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
    function createRow(rank, team, point, win, draw, lose, gotGoal, lostGoal, diffGoal, aclFlg) {
        var row = Ti.UI.createTableViewRow(style.standings.tableViewRow);
        // 順位
        var rankLabel = createRowLabel(rank, 5, 20, 'center');
        row.add(rankLabel);
        // チーム
        var teamWidth = 60;
        if(aclFlg) teamWidth = 100;
        if(team.length > 4) {
            var idx = team.indexOf("・");
            team = team.substring(0, idx);
        }
        var teamLabel = createRowLabel(team, 30, teamWidth, 'left');

        row.add(teamLabel);
        var leftPos = 93;
        var w = 33;
        var w2 = 26;
        if(aclFlg) {
            leftPos += 30;
            w = 28;
        }
        // 勝点
        var pointLabel = createRowLabel(point, leftPos, w2);
        row.add(pointLabel);
        // 勝
        var winLabel = createRowLabel(win, leftPos+(w*1), w2);
        row.add(winLabel);
        // 分
        var drawLabel = createRowLabel(draw, leftPos+(w*2), w2);
        row.add(drawLabel);
        // 負
        var loseLabel = createRowLabel(lose, leftPos+(w*3), w2);
        row.add(loseLabel);
        // 得
        var gotGoalLabel = createRowLabel(gotGoal, leftPos+(w*4), w2);
        row.add(gotGoalLabel);
        // 失
        var lostGoalLabel = createRowLabel(lostGoal, leftPos+(w*5), w2);
        row.add(lostGoalLabel);
        // 差
        var diffGoalLabel = createRowLabel(diffGoal, leftPos+(w*6), w2);
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
