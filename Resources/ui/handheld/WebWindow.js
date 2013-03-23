/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
	var style = require("util/style").style;
    var util = require("util/util").util;
	var newsSource = require("model/newsSource");
	//TODO style.js
	var self = Ti.UI.createWindow({
		title: webData.title
		,backgroundColor: 'black'
		,barColor: 'red'
	});
	
    var webView = Ti.UI.createWebView();
    var back;
    var forward;
    var facebook;
    var twitter;
    if(webData.toolbarVisible) { //twitter画面以外から遷移した場合
        createToolbar();
    }
    addWebViewEventListener();
    var simpleDispModeProp = Ti.App.Properties.getBool("simpleDispMode");
    //tweetから来た場合
    if(webData.html) {
        webView.html = webData.html;
        webView.scalesPageToFit = false;
        self.add(webView);
    }
    //シンプル表示モード
	else if(simpleDispModeProp &&
	    webData.content && 
		(webData.content != "" && 
		 webData.content.indexOf('<img src="http://feeds.feedburner.com') == -1 
		 )
	) {
		Ti.API.debug("-----------webWindow 1 link = " + webData.link);
		var content = createWebContent(webData);
		webView.scalesPageToFit = false;
		webView.html = content;
		self.add(webView);
	}
	//URL直接表示モード
	else {
		Ti.API.debug("----------- 2  link = " + webData.link);
		//TODO 別メソッド
        // var ind = Ti.UI.createActivityIndicator();
		// ind.show();
		// webView.addEventListener("load", function(e) {
			// ind.hide();
		// });
        webView.scalesPageToFit = true;
		webView.setUrl(webData.link);
		self.add(webView);
	}
	
	/**
	 * WebViewイベントリスナ設定
	 */
	function addWebViewEventListener() {
        var ind;
        webView.addEventListener('beforeload',function(e){
            Ti.API.info('beforeloadEvent1 e.navigationType=' + e.navigationType + ", e.url=" + e.url);
            if(!ind && e.navigationType != 5) {//リンク先URLのhtml中の画像やiframeの場合、5
                Ti.API.info('beforeload #################### ');
                Ti.API.info(util.toString(e));
                webView.opacity = 0.8;
                Ti.API.info(util.formatDatetime2(new Date()) + '  インジケータshow');
//                webView.add(ind);
//TODO style
                ind = Ti.UI.createActivityIndicator({
                    style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK
                });
                webView.add(ind);
                ind.show();
                // webView.url = e.url;
                Ti.API.info('beforeload end-------------------------------- ');
            }
        }); 
        // ロード完了時にインジケータを隠す
        webView.addEventListener("load", function(e) {
            // Ti.API.info('loadEvent1 e.navigationType=' + e.navigationType);
            // if(ind && e.navigationType != 5) {
            webView.scalesPageToFit = true;
            if(ind) {
                Ti.API.info('load1 ####################');
                Ti.API.info(util.toString(e));
                Ti.API.info(util.formatDatetime2(new Date()) + '  インジケータhide');
                webView.opacity = 1.0;
                ind.hide();
                ind = null;
                Ti.API.info('load end-------------------------------- ');
            }
            //ツールバーボタン制御
            if(webData.toolbarVisible) {
                var title = webView.evalJS("document.title");
                if(title != "" && title != "タイムラインの写真") {//FBの写真
                    self.title = title;
                }
                back.setEnabled(webView.canGoBack());
                forward.setEnabled(webView.canGoForward());
                if(webData.link.indexOf("facebook.com") == -1 && webView.url.indexOf("facebook.com") == -1) {
                    //facebookのページに対しては外部からシェアできない
                    facebook.setEnabled(true);
                } else {
                    facebook.setEnabled(false);
                }
            }
        });
	}
	
	/**
	 * ツールバーを生成する。
	 */
	function createToolbar() {
    	//ツールバー
        back = Ti.UI.createButton({
            image: "/images/arrow_left.png"
            ,enabled: false
        });
        back.addEventListener("click", function(e){
            webView.goBack();
        });
        forward = Ti.UI.createButton({
            image: "/images/arrow_right.png"
            ,enabled: false
        });
        forward.addEventListener("click", function(e){
            webView.goForward();
        });
        twitter = Ti.UI.createButton({
            image: "/images/twitter_icon.png"
            ,enabled: false
        });
        facebook = Ti.UI.createButton({
            image: "/images/facebook_icon.png"
            ,enabled: false
        });
        // WebViewロード時、戻るボタン、次へボタンの有効化、無効化
/*        webView.addEventListener('load', function(e) {
                Ti.API.info('load2 ####################');
                Ti.API.info(util.toString(e));
            // Ti.API.info('loadEvent2 e.navigationType=' + e.navigationType);
            // if(e.navigationType != 5) {
                Ti.API.info('load★  e.url=' + e.url);
                Ti.API.info('webView.url=' + e.url);
                title = webView.evalJS("document.title");
                if(title != "" && title != "タイムラインの写真") {//FBの写真
                    self.title = title;
                }
                back.setEnabled(webView.canGoBack());
                forward.setEnabled(webView.canGoForward());
                if(webData.link.indexOf("facebook.com") == -1 && webView.url.indexOf("facebook.com") == -1) {
                    //facebookのページに対しては外部からシェアできない
                    facebook.setEnabled(true);
                } else {
                    facebook.setEnabled(false);
                }
                Ti.API.info('load2 end-------------------------------- ');
            // }
        });*/
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
    }
    
    /**
     * 簡易ページに表示するコンテンツを生成する。
     */
    function createWebContent(webData) {
        return "<a href=\"" + webData.link + "\">" + webData.title  + "</a>"
            + " " + webData.pubDate + "<br/>"
            + webData.siteName + "<br/><br/>"
            + webData.content + "<br/><br/>" 
            + "<a href=\"" + webData.link + "\">サイトを開く</a><br/><br/>";      
    }

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
