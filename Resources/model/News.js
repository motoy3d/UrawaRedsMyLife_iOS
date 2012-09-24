var util = require("util/util").util;
var style = require("util/style").style;
var newsSource = require("model/newsSource");

var LOAD_FEED_SIZE = 25;
var feedUrl = "http://www.google.com/reader/public/atom/user"
	+ "%2F12632507706320288487%2Flabel%2FUrawaReds?n=" + LOAD_FEED_SIZE;

/**
 * ニュース情報
 */
function News() {
	var self = {};
	self.continuation = "";	// さらに読み込む場合のGoogle Readerキーワード
	self.updating = false;	// スクロール時のテーブルビュー更新
	self.visitedUrls = new Array();
	self.loadFeedSize = LOAD_FEED_SIZE;
	
	self.loadNewsFeed = loadNewsFeed;	//function
	self.getContinuation = getContinuation;	//function
	
	return self;
};

/**
 * フィードを読み込んで表示する
 */
function loadNewsFeed(continuation, callback, reloadRow) {
	Ti.API.info('loadNewsFeed start-------------------------------');
	// オンラインチェック
	if(!Ti.Network.online) {
		//indWin.close();
		util.openOfflineMsgDialog();
		return;
	}

	// Google Readerで「次へ」をするためのキー文字列
	var continuationPart = "";
	if(continuation != "") {
		continuationPart = "&c=" + continuation; 
	}

	// フィードを取得
	var selectFeedQuery = "SELECT "
		+ "id.original-id, link.href, title.content, source.title.content,"
		+ "published, content.content, summary.content"
		+ " FROM feed WHERE url='" + feedUrl + continuationPart + "'"
		+ " AND title.content NOT LIKE 'PR%'"
		+ " | sort (field=\"published\", descending=\"true\")"
		+ " | unique (field=\"title\")";
		
	Ti.API.info("★★★YQL " + selectFeedQuery);
	Ti.Yahoo.yql(selectFeedQuery, function(e) {
		try {
			if(e.data == null) {
				return;
			}
			Ti.API.info("e.data.entry■" + e.data.entry);
			var rowsData = e.data.entry.map(
				function(item) {
					var row = createNewsRow(item);
//					Ti.API.info("row=====" + row);
					return (row);
				}
			);
//			Ti.API.info("return rowsData■" + rowsData);
			callback.success(rowsData, continuation);
		} catch(ex) {
			Ti.API.error("loadNewsFeedエラー：" + ex);
			callback.fail();
			//indWin.close();
		} finally {
		}
	});
}

/**
 * Google Readerのcontinuationを取得する
 */
function getContinuation(continuation, callback) {
	// Google Readerで「次へ」をするためのキー文字列
	var continuationPart = "";
	if(continuation != "") {
		continuationPart = "&c=" + continuation; 
	}

	// continuationの取得
	var selectContinuationQuery = "SELECT continuation FROM xml WHERE url='" 
		+ feedUrl + continuationPart + "'";
	var isContinuationUpdate = false;
	Ti.API.info("★YQL " + selectContinuationQuery);
	Ti.Yahoo.yql(selectContinuationQuery, function(e) {
		continuation = e.data.feed.continuation;
		Ti.API.info("continuation=== " + continuation);
		callback.success(continuation);
	});
}

/**
 * rowを生成する
 */
function createNewsRow(item) {
	//Ti.API.info("アイテム=" + item);
	// for(var v in item) {
		// Ti.API.info("\t" + v + ":" + item[v]);
	// }
	var vid = "id";
	var oid = "original-id";
//	Ti.API.info("source---------" + item.source.title);
	var idobj = item[vid];
//	Ti.API.info("link.href---------" + item.link.href);
//	Ti.API.info("id.original-id---------" + idobj[oid]);
	
	var row = Ti.UI.createTableViewRow(style.news.tableViewRow);
//	var rowView = Ti.UI.createView(style.news.rowView);
//	row.add(rowView);

	// タイトルラベル
	var titleLabel = Ti.UI.createLabel(style.news.titleLabel);
	var itemTitle = item.title;
	// Ti.API.info('itemTitle=' + itemTitle);
	itemTitle = util.replaceAll(itemTitle, "<b>", "");
	itemTitle = util.replaceAll(itemTitle, "</b>", "");
	itemTitle = util.replaceAll(itemTitle, "<br>", " ");
	itemTitle = util.replaceAll(itemTitle, "<br/>", " ");
    itemTitle = util.replaceAll(itemTitle, "&amp;", "&");
	titleLabel.text = itemTitle;
	row.add(titleLabel);
	// Ti.API.info("itemTitle====" + itemTitle);
	// 更新日時
	var pubDate = parseDate(item.published);
	//Ti.API.info("pubDate=====" + pubDate);
	var minutes = pubDate.getMinutes();
	if(minutes < 10) {
		minutes = "0" + minutes;
	}
	var pubDateText = (pubDate.getMonth() + 1) + "/" + pubDate.getDate() 
		+ " " + pubDate.getHours() + ":" + minutes;
	
	// サイト名+更新日時ラベル
	var link = "";
	//Ti.API.info("★" + idobj[oid].toString());
	if(idobj[oid] && idobj[oid].toString().indexOf("http") == 0) {
		link = idobj[oid].toString();
		if(link.indexOf("http://www.google.com/url") == 0) {
			// Googleアラート等の場合、q=からリンク先を抽出
			link = link.substring(link.indexOf("q=")+2, link.indexOf("&ct="));
		}
//		Ti.API.info("リンク1====" + link);
	} else if(item.link instanceof Array) {
		var linkLen = item.link.length;
		for(var i=0; i<linkLen; i++) {
			link = item.link[i].href;
			// 画像の場合は次へ
			if(util.endsWith(link, '.jpg', true) || util.endsWith(link, '.png', true)) {
				continue;
			} else {
				break;
			}
		}
//		Ti.API.info("リンク2====" + link);
	} else {
		link = item.link.href;
//		Ti.API.info("リンク3====" + link);
	}
	var fullSiteName = item.source.title;
	if(fullSiteName.toString().indexOf("Google") == 0) {
		fullSiteName = "";
	}
	var siteName = newsSource.optimizeSiteName(item.source.title);
	Ti.API.info("siteName1====" + siteName + ", link=" + link);
	if('UrawaReds' == siteName) {
		siteName = newsSource.getSiteName(link);
		fullSiteName = siteName;
		Ti.API.info("   UrawaReds. siteName====" + siteName + ", link=" + link);
	}
	var siteNameLabel = Ti.UI.createLabel(style.news.siteNameLabel);
	siteNameLabel.text = siteName + "   " + pubDateText;
	// row情報セット
	row.add(siteNameLabel);
	row.fullSiteName = fullSiteName;
	row.siteName = siteName;
	row.pageTitle = item.title;
	row.link = link;
	if(item.content) {
		row.content = item.content;
	}
	else if(item.summary) {
		row.content = item.summary;
	}
//	Ti.API.info("-------------return row" + row);
	row.pubDate = pubDateText;
	return row;

}

// 日付のパース
function parseDate(str){// str==yyyy-mm-ddThh:mm:ssZ
    //strdate==YYYY/mm/dd hh:mm:ss
    var strDate = str.split('\+')[0].replace('T',' ').replace('-','\/').replace('-','\/').replace('Z','');
    var date = new Date(strDate);
    var time = date.getTime() + 32400000;
    date.setTime(time);
    return date;
};

module.exports = News;
