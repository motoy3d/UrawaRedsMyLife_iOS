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
		,barColor: 'red'
	});
	
    var webView = Ti.UI.createWebView();
	
	//var indWin = customIndicator.create();
	// Ti.API.info("##### webData.content=[" + webData.content + "]");
	if(webData.content && 
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
	return self;
};

module.exports = WebWindow;
