/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
	var style = require("util/style").style;
	var newsSource = require("model/newsSource");
	var self = Ti.UI.createWindow({
		title: webData.title,
		backgroundColor: 'white'
	});
	
	var webView = Ti.UI.createWebView({
	    html: webData.content
	});
	
	//var indWin = customIndicator.create();
	// Ti.API.info("##### webData.content=[" + webData.content + "]");
	if(webData.content && 
		(webData.content != "" && 
		 webData.content.indexOf('<img src="http://feeds.feedburner.com') == -1 
		 )
	) {
		// Ti.API.debug("----------- 1");
		var content = 
			"<a href=\"" + webData.link + "\">" + webData.title  + "</a>"
			+ " " + webData.pubDate + "<br/>"
			+ webData.siteName 
			+ webData.content + "<br/><br/>" 
			+ "<a href=\"" + webData.link + "\">サイトを開く</a>";
		webView.html = content;
		self.add(webView);
	} else {
		// Ti.API.debug("----------- 2");
		var ind = Ti.UI.createActivityIndicator();
		ind.show();
		webView.addEventListener("load", function(e) {
			ind.hide();
		});
		webView.url = webData.link;
		self.add(webView);	
	}
	return self;
};

module.exports = WebWindow;
