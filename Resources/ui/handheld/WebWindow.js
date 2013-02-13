/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
	var style = require("util/style").style;
	var newsSource = require("model/newsSource");
	//TODO style.js
	var self = Ti.UI.createWindow({
		title: webData.title,
		backgroundColor: 'black'
		,barColor: 'red'
	});
	
    var webView = Ti.UI.createWebView();
    var simpleDispModeProp = Ti.App.Properties.getBool("simpleDispMode");
    if(webData.html) {  //tweet
        webView.html = webData.html;
        self.add(webView);
    }
	else if(simpleDispModeProp &&
	    webData.content && 
		(webData.content != "" && 
		 webData.content.indexOf('<img src="http://feeds.feedburner.com') == -1 
		 )
	) {
		Ti.API.debug("-----------webWindow 1 link = " + webData.link);
		var content = 
			"<a href=\"" + webData.link + "\">" + webData.title  + "</a>"
			+ " " + webData.pubDate + "<br/>"
			+ webData.siteName + "<br/><br/>"
			+ webData.content + "<br/><br/>" 
			+ "<a href=\"" + webData.link + "\">サイトを開く</a>";		
		webView.html = content;
		self.add(webView);
	} else {
		Ti.API.debug("----------- 2  link = " + webData.link);
        var ind = Ti.UI.createActivityIndicator();
		ind.show();
		webView.addEventListener("load", function(e) {
			ind.hide();
		});
		webView.setUrl(webData.link);
		self.add(webView);	
	}
	//ツールバー
    var back = Ti.UI.createButton({
        image: "/images/arrow_left.png"
        ,enabled: false
    });
    back.addEventListener("click", function(e){
        webView.goBack();
    });
    var forward = Ti.UI.createButton({
        image: "/images/arrow_right.png"
        ,enabled: false
    });
    forward.addEventListener("click", function(e){
        webView.goForward();
    });
    var twitter = Ti.UI.createButton({
        image: "/images/twitter_icon.png"
        ,enabled: false
    });
    var facebook = Ti.UI.createButton({
        image: "/images/facebook_icon.png"
        ,enabled: false
    });
    // WebViewロード時、戻るボタン、次へボタンの有効化、無効化
    webView.addEventListener('load', function(e) {
        Ti.API.info('load★  e.url=' + e.url);
        Ti.API.info('webView.url=' + e.url);
        title = webView.evalJS("document.title");
        if(title != "タイムラインの写真") {//FBの写真
            self.title = title;
        }
        back.setEnabled(webView.canGoBack());
        forward.setEnabled(webView.canGoForward());
        if(webData.link.indexOf("facebook.com") == -1 && webView.url.indexOf("facebook.com") == -1) {
            facebook.setEnabled(true);
        } else {
            facebook.setEnabled(false);
        }
    });

    // facebookボタン
    facebook.addEventListener("click", function(e){
        if(!Ti.Facebook.loggedIn) {
            // ログイン済みでない場合はログインする
            Ti.Facebook.appid = '130375583795842';
            Ti.Facebook.permissions = ['publish_stream', 'read_stream']; // facebook開発者ページで設定
            Ti.Facebook.addEventListener('login', function(e) {
                if (e.success) {
                    facebookShare();    //ログイン成功後シェア
                } else if (e.error) {
                    Ti.API.error('-----facebookログインエラー');
                } else if (e.cancelled) {
                    Ti.API.info('-----facebookログインキャンセル');
                }
            });
            Ti.Facebook.authorize();    //認証実行
        } else {
            facebookShare();
        }
    });
    var flexSpace = Ti.UI.createButton({
        systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    self.setToolbar([flexSpace, /*twitter,*/ flexSpace, facebook, flexSpace, back, flexSpace, forward]);
    
    /**
     * facebookでシェアする
     */	
	function facebookShare() {
//        var image = webData.image;
//        Ti.API.info('画像＝＝＝' + image);
        var link = webView.url; 
        if(webView.url.indexOf("app://") == 0) {
            link = webData.link; //簡易表示の場合はwebData.link
        }
        Ti.API.info('facebookシェア link=' + link);
        var data = {
            link : link
//                ,name : webData.title
//                ,message :  "message"
//                ,caption : content
//                ,picture : image
            ,locale : "ja_JP"
//                description : "ユーザの投稿文"
        };
        Ti.App.Analytics.trackPageview('/fbShareDialog');   //ダイアログを開く
        //投稿ダイアログを表示
        Ti.Facebook.dialog(
            "feed", 
            data, 
            function(r){
                if(r.success) {
                    Ti.App.Analytics.trackPageview('/fbShare'); //投稿成功
                }
            }
        );
	}
	return self;
};

module.exports = WebWindow;
