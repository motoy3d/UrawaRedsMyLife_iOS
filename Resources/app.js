(function() {
    Ti.API.info('アプリ起動-----------------');
    var config = require("/config").config;
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var XHR = require("/util/xhr");
    var message = "";

	startAnalytics();
	initDB();
	
    //起動回数保存
    var launchAppCount = Ti.App.Properties.getInt("LaunchAppCount");
    if (!launchAppCount) {
        launchAppCount = 0;
        Ti.App.Properties.setBool("shareAndReviewDoneFlg", false);
    }
    Ti.App.Properties.setInt("LaunchAppCount", ++launchAppCount);
    Ti.API.info('アプリ起動回数 : ' + launchAppCount);
    
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		model = Ti.Platform.model,
		name = Ti.Platform.name,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth,
		density = Ti.Platform.displayCaps.density,
		dpi = Ti.Platform.displayCaps.dpi;
	Ti.API.info('★★osname=' + osname);
	Ti.API.info('★★version=' + version);
    Ti.API.info('★★name=' + name);
    Ti.API.info('★★model=' + model);
	Ti.API.info('★★width/height=' + width + "/" + height);
	Ti.API.info('★★density=' + density);
	Ti.API.info('★★dpi=' + dpi);
    Ti.App.Analytics.trackPageview("/startApp?m=" + model + "&v=" + version/* + "&wh=" + width + "x" + height*/);
    
	
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	Ti.UI.iPhone.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
	
	// 全置換：全ての文字列 org を dest に置き換える  
	String.prototype.replaceAll = function (org, dest) {  
	  return this.split(org).join(dest);  
	};
	//バイト数を返す。
	String.prototype.getBytes = function() {
        var count = 0;
        for (i=0; i<this.length; i++) {
            var n = escape(this.charAt(i));
            if (n.length < 4) count++; else count+=2;
        }
        return count;
	};
	// var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	// var tabGroup = new ApplicationTabGroup();
	// // TabGroupをglobalにセット
	// Ti.App.tabGroup = tabGroup;
	// // スプラッシュイメージを一定時間表示
	// Ti.API.info(new Date() + "-------------- WAIT START ------------------");
	// var startTime = (new Date()).getTime();
	// var waitMilliSeconds = 2000;
	// while (true) {
		// if ( ( new Date() ).getTime() >= startTime + waitMilliSeconds ) break;
	// }
    // tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});

    //メッセージ
    var xhr = new XHR();
    var messageUrl = config.messageUrl + "&os=" + osname + "&version=" + version;
    Ti.API.info('メッセージURL：' + messageUrl);
    xhr.get(messageUrl, onSuccessCallback, onErrorCallback, { ttl: 1 });
    function onSuccessCallback(e) {
        Ti.API.info('メッセージデータ:' + e.data);
        if(e.data) {
            var json = JSON.parse(e.data);
            if(json && json[0]) {
                if (json[0].aclFlg) {
                    Ti.App.aclFlg = json[0].aclFlg;    //ALC出場フラグ(true/false)
                }
                if (json[0].adType) {
                    Ti.App.adType = json[0].adType;    //広告タイプ(1:アイコン、2:バナー)
                }
                if(json[0].message){
                    message = json[0].message;
                }
            }
        }
        var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
        var tabGroup = new ApplicationTabGroup();
        // TabGroupをglobalにセット
        Ti.App.tabGroup = tabGroup;
        // スプラッシュイメージを一定時間表示
        Ti.API.info(new Date() + "-------------- WAIT START ------------------");
        var startTime = (new Date()).getTime();
        var waitMilliSeconds = 2000;
        while (true) {
            if ( ( new Date() ).getTime() >= startTime + waitMilliSeconds ) break;
        }
        if(osname == "iphone") {
            tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});      
        } else {
            tabGroup.open();
        }
        // メッセージがある場合は表示
        if(message) {
            var dialog = Ti.UI.createAlertDialog({title: 'お知らせ', message: message});
            dialog.show();
        }
        // シェア・レビュー依頼
        if (launchAppCount == 5 || launchAppCount % 15 == 0) {
            openShareAndReviewWindow();
        }
    };
    function onErrorCallback(e) {
    };

})();

/**
 * DB初期化
 */
//TODO 古いデータの削除
function initDB() {
    var util = require("util/util").util;
    var db = Ti.Database.open('urawareds.my.life');
    db.execute('CREATE TABLE IF NOT EXISTS visitedUrl (url TEXT, date INTEGER)');
    var date = new Date();
    var days = 10;
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000 * days);
    var condDate = "'" + util.formatDate(date) + "'";
    // 一定日数以前のデータを削除する
    var deleteSql = "DELETE FROM visitedUrl WHERE date < " + condDate;
    db.execute(deleteSql);
    db.close();
}

/**
 * Google Analyticsの処理を初期化する
 */
function startAnalytics() {
    var Analytics = require('/util/Ti.Google.Analytics');
	var analytics = new Analytics('UA-30928840-1');
    var util = require("util/util").util;
	Titanium.App.addEventListener('analytics_trackPageview', function(e){
	    var path = "/app/" + util.getTeamId() + "/" + Ti.Platform.name;
	    analytics.trackPageview(path + e.pageUrl);
	});
	Ti.App.addEventListener('analytics_trackEvent', function(e){
	    analytics.trackEvent(e.category, e.action, e.label, e.value);
	});
	Ti.App.Analytics = {
	    trackPageview:function(pageUrl){
	        Ti.App.fireEvent('analytics_trackPageview', {pageUrl:pageUrl});
	    },
	    trackEvent:function(category, action, label, value){
	        Ti.App.fireEvent('analytics_trackEvent', {category:category, action:action, label:label, value:value});
	    }
	};
	analytics.start(7);	//7秒に1回データ送信
}


/**
 * シェア・レビュー依頼を行う。
 */
function openShareAndReviewWindow() {
    var shareAndReviewDoneFlg = Ti.App.Properties.getBool("shareAndReviewDoneFlg");
    if (!shareAndReviewDoneFlg || shareAndReviewDoneFlg == false) {
        var dialog = Ti.UI.createAlertDialog({
            message: "アプリをお楽しみでしょうか？"
            ,buttonNames: ["いいえ", "はい"]
        });
        dialog.addEventListener('click', function(e) {
            if (e.index === 0) {
                //いいえの場合
            } else if (e.index == 1) {
                //はいの場合
                var dialog = Ti.UI.createAlertDialog({
                    message: 'よろしければ、レビューまたはシェアをお願いします m(_ _)m',
                    ok: 'OK',
                    title: ''
                });
                dialog.show();

                var ConfigWindow = require("/ui/handheld/ConfigWindow");
                var configWindow = new ConfigWindow();
                configWindow.tabBarHidden = true;
                Ti.App.tabGroup.activeTab.open(configWindow, {animated: true});
                Ti.App.Properties.setBool("shareAndReviewDoneFlg", true);
                
            }
        });    
        dialog.show();
    }
}