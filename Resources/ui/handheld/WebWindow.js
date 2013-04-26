/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
	var style = require("util/style").style;
    var util = require("util/util").util;
	var newsSource = require("model/newsSource");
    var social = require('de.marcelpociot.social');
	//TODO style.js
	var self = Ti.UI.createWindow({
		title: webData.title
		,backgroundColor: 'black'
		,barColor: 'red'
	});
	
    var webView = Ti.UI.createWebView();
    var flexSpace = Ti.UI.createButton({
        systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    var back;
    var forward;
    var facebook;
    var twitter;
    var line;
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
                //FBの写真、レッズプレスの場合は上書きしない
                if(title != "" && title != "タイムラインの写真" && webData.link.indexOf("redspress") == -1) {
                    self.title = title;
                }
                back.setEnabled(webView.canGoBack());
                forward.setEnabled(webView.canGoForward());
                twitter.setEnabled(true);
                if(webData.link.indexOf("facebook.com") == -1 && webView.url.indexOf("facebook.com") == -1) {
                    //facebookのページに対しては外部からシェアできない
                    facebook.setEnabled(true);
                } else {
                    //TODO test
                    facebook.setEnabled(true);
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
        // LINE
        line = Ti.UI.createButton({
            image: "/images/line_logo.png"
            ,enabled: true
        });
        
               
        // twitterはiOS5で統合されたが、titanium-social-modulは
        // FB(iOS6から)が含まれているためiOS5でエラーになる。
        if(Ti.Platform.version > "6.0") {
            twitter = Ti.UI.createButton({
                image: "/images/twitter_icon.png"
                ,enabled: false
            });
        } else {
            twitter = flexSpace;
        }
        facebook = Ti.UI.createButton({
            image: "/images/facebook_icon.png"
            ,enabled: false
        });
        // lineで送るボタン
        line.addEventListener("click", lineSend);
        // twitterボタン
        twitter.addEventListener("click", tweet);
        // facebookボタン
        facebook.addEventListener("click", function(e){
            Ti.App.Analytics.trackPageview('/fbShareDialog');   //ダイアログを開く
            if(Ti.Platform.version > "6.0") {
                facebookShareBySocialModule();
            } else {
                if(!Ti.Facebook.loggedIn) {
                    // ログイン済みでない場合はログインする
                    Ti.Facebook.appid = '130375583795842';
                    Ti.Facebook.permissions = ['publish_stream', 'read_stream']; // facebook開発者ページで設定
                    Ti.Facebook.addEventListener('login', function(e) {
                        if (e.success) {
                            facebookShareByWebView();    //ログイン成功後シェア
                        } else if (e.error) {
                            Ti.API.error('-----facebookログインエラー');
                        } else if (e.cancelled) {
                            Ti.API.info('-----facebookログインキャンセル');
                        }
                    });
                    Ti.Facebook.authorize();    //認証実行
                } else {
                    facebookShareByWebView();
                }
            }
        });
        self.setToolbar([line, flexSpace, twitter, flexSpace, facebook, flexSpace, flexSpace, back, flexSpace, forward]);
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
     * LINEに投稿する。(iOS5)
     */
    function lineSend(e) {
        Ti.App.Analytics.trackPageview('/lineDialog');   //ダイアログを開く
        var link = webView.url; 
        if(webView.url.indexOf("app://") == 0) {
            link = webData.link; //簡易表示の場合はwebData.link
        }
        var title = webView.evalJS("document.title");
        if(!title || link.indexOf("redspress") != -1) {
            //レッズプレスはjquery mobileを使用しており、titleタグが上書きされてしまうため
            title = webData.titleFull;
        }
        var msg = encodeURIComponent(title + "  ") + link;
        Ti.API.info("LINEへのパラメータ=" + msg);
        Ti.Platform.openURL("line://msg/text/" + msg);
    }
    /**
     * twitterに投稿する。(iOS5)
     */
    function tweet(e) {
        Ti.App.Analytics.trackPageview('/tweetDialog');   //ダイアログを開く
        var link = webView.url; 
        if(webView.url.indexOf("app://") == 0) {
            link = webData.link; //簡易表示の場合はwebData.link
        }
        var title = webView.evalJS("document.title");
        if(!title || link.indexOf("redspress") != -1) {
            //レッズプレスはjquery mobileを使用しており、titleタグが上書きされてしまうため
            title = webData.titleFull;
        }
        social.showSheet({
            service:  'twitter',
            message:  title,
            urls:       [link],
            success:  function(){
                Ti.API.info('ツイート成功');
                Ti.App.Analytics.trackPageview('/tweet');
            },
            error: function(){
                alert("ツイートに失敗しました");
            }
        });
    }
    /**
     * facebookでシェアする(titanium-social-modul使用。iOS6から可)
     */ 
    function facebookShareBySocialModule() {
        var link = webView.url; 
        if(webView.url.indexOf("app://") == 0) {
            link = webData.link; //簡易表示の場合はwebData.link
        }
        var title = webView.evalJS("document.title");
        Ti.API.info('title 1 >>>>>>>>>>>>>>>>>>>>>>>>> ' + title);
        if(!title || link.indexOf("redspress") != -1) {
            //レッズプレスはjquery mobileを使用しており、titleタグが上書きされてしまうため
            title = webData.titleFull;
        Ti.API.info('title 2 >>>>>>>>>>>>>>>>>>>>>>>>> ' + title);
        }
        social.showSheet({
            service:  'facebook',
            message:  title,
            urls:       [link],
            success:  function(){
                Ti.API.info('FBシェア成功');
                Ti.App.Analytics.trackPageview('/fbShare');
            },
            error: function(){
                alert("FBシェアに失敗しました");
            }
        });
    }
    /**
     * facebookでシェアする
     */	
	function facebookShareByWebView() {
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
