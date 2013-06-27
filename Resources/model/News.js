var util = require("util/util").util;
var style = require("util/style").style;
var newsSource = require("model/newsSource");

var LOAD_FEED_SIZE = 25;
var feedUrlBase = "http://sub0000499082.hmk-temp.com/redsmylife/news.json"
    + "?teamId=reds&count=" + LOAD_FEED_SIZE;
var visitedUrlList = new Array();

/**
 * ニュース情報
 */
function News() {
	var self = {};
    self.newest_item_timestamp = 0; // 最新データを読み込む場合のパラメータ（最新フィードのタイムスタンプ）
    self.oldest_item_timestamp = 0; // 古いデータを読み込む場合のパラメータ（最古フィードのタイムスタンプ）
	self.updating = false;	// スクロール時のテーブルビュー更新
	self.visitedUrls = new Array();
	self.loadFeedSize = LOAD_FEED_SIZE;
	
	self.loadNewsFeed = loadNewsFeed;	//function
	self.saveVisitedUrl = saveVisitedUrl;  //function
	
	visitedUrlList = getVisitedUrlList();
//	Ti.API.info('visitedUrlList読み込み：' + visitedUrlList);
//    Ti.API.info('visitedUrlList数：' + visitedUrlList.length);
	self.visitedUrlList = visitedUrlList;
	return self;
};

/**
 * フィードを読み込んで表示する
 * @kind ("firstTime" or "olderEntries" or "newerEntries")
 * @continuation kind=olderEntriesの場合のみ使用。Google Reader用「次へ」用パラメータ 
 * ＠newest_item_timestamp kind=newerEntriesの場合のみ使用。最新データ取得時のstart_time
 * @callback
 */
function loadNewsFeed(kind, minItemDatetime, maxItemDatetime, callback) {
    Ti.API.info('---------------------------------------------------------------------');
    Ti.API.info(util.formatDatetime() + '  ニュース読み込み kind=' + kind);
    Ti.API.info('---------------------------------------------------------------------');
	// オンラインチェック
	if(!Ti.Network.online) {
		callback.fail(style.common.offlineMsg);
		return;
	}
    Ti.App.Analytics.trackPageview('/newsList');

	// 古いデータ・最新データの読み込み条件
	var condition = "";
	if('olderEntries' == kind) {
        condition = "&max=" + maxItemDatetime;
    } else if('newerEntries' == kind) {
        condition = "&min=" + minItemDatetime;
    }
    var feedUrl = feedUrlBase + condition;
	// フィードを取得
	var selectFeedQuery = "SELECT "
		//+ "id.original-id, link.href, title.content, source.title.content,"
		//+ "published, content.content, summary.content"
		//+ ", crawl-timestamp-msec"//最新データ取得時に使用
		+ "json.entry_title, json.entry_url"
		+ ", json.published_date, json.published_date_num"
		+ ", json.content, json.site_name"
		+ " FROM json WHERE url='" + feedUrl + "'" 
		;
	Ti.API.info("★★★YQL " + selectFeedQuery);
	Ti.Yahoo.yql(selectFeedQuery, function(e) {
        if(e.data == null) {
            Ti.API.info('e.data = null');
            callback.success(null, null, null);
            return;
        }
		try {
			Ti.API.info("e.data.json■" + e.data.json);
			var rowsData = null;
            var newest_item_timestamp = 0;
            var oldest_item_timestamp = 0;
			if(e.data.json.map) {
                rowsData = e.data.json.map(
                    function(item) {
                        var row = createNewsRow(item.json);
    //                  Ti.API.info("row=====" + row);
                        var pubDateNum = item.json.published_date_num;
                        if(newest_item_timestamp < pubDateNum) {
                            newest_item_timestamp = pubDateNum;
                        }
                        if(oldest_item_timestamp == 0 || pubDateNum < oldest_item_timestamp) {
                            oldest_item_timestamp = pubDateNum;
                        }
                        return (row);
                    }
                );
                // if("firstTime" == kind || "newerEntries" == kind) {
                    // newest_item_timestamp = max;
                // }
                // if("firstTime" == kind || "olderEntries" == kind) {
                    // oldest_item_timestamp = min;
                // }
			}
			Ti.API.info('---------------newest_item_timestamp=' + newest_item_timestamp);
            Ti.API.info('---------------oldest_item_timestamp==' + oldest_item_timestamp);
//			Ti.API.info("return rowsData■" + rowsData);
			callback.success(rowsData, newest_item_timestamp, oldest_item_timestamp);
		} catch(ex) {
			Ti.API.error("loadNewsFeedエラー：" + ex);
			callback.fail('読み込みに失敗しました');
			//indWin.close();
		}
	});
}

/**
 * rowを生成する
 */
function createNewsRow(item) {
	// Ti.API.info("アイテム=" + item);
	// for(var v in item) {
		// Ti.API.info("\t" + v + ":" + item[v]);
	// }
	
	var row = Ti.UI.createTableViewRow(style.news.tableViewRow);
	var rowView = Ti.UI.createView(style.news.rowView);
    // 本文
    var content = "";
    if(item.content) {
        content = item.content;
    }
    else if(item.summary) {
        content = item.summary;
    }
    // 画像
    var hasImage = false;
    var imgTagIdx = content.indexOf("<img");
    var imgUrl = "";
    if(imgTagIdx != -1) {
        var srcIdx = content.indexOf("src=", imgTagIdx);
        if(srcIdx != -1) {
            var urlStartIdx = srcIdx + 5;
            var urlEndIdx = content.indexOf('"', urlStartIdx);
            imgUrl = content.substring(urlStartIdx, urlEndIdx);
            imgUrl = util.replaceAll(imgUrl, "&amp;", "&");
//            Ti.API.debug('画像＝＝＝＝＝' + imgUrl + "  >  " + item.entry_title);
            // アイコン等はgifが多いのでスキップ
            if(!util.isUnnecessaryImage(imgUrl)) {
                var imgLabel = Ti.UI.createImageView(style.news.imgView);
                var imgContainer = Ti.UI.createImageView(style.news.imgViewContainer);
                imgLabel.image = imgUrl;
                imgContainer.add(imgLabel);
                rowView.add(imgContainer);
                hasImage = true;
            } else {
                imgUrl = "";
            }
        }
    }
	// タイトルラベル
	var titleLabel = Ti.UI.createLabel(style.news.titleLabel);
	var itemTitleFull = util.deleteUnnecessaryText(item.entry_title);
//	Ti.API.info('itemTitle=' + itemTitle);
    var itemTitle = itemTitleFull;
    if(itemTitleFull.length > 50) {
        itemTitle = itemTitleFull.substring(0, 50) + "...";
    }
	titleLabel.text = itemTitle;
	rowView.add(titleLabel);
//	Ti.API.info("最適化後：itemTitle====" + itemTitle);
	// 更新日時
	var pubDate = parseDate(item.published_date);
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
	link = item.entry_url;
	
	// 既読確認
	if(util.contains(visitedUrlList, link)) {
        row.backgroundColor = style.news.visitedBgColor;
	}
    // サイト名
	var fullSiteName = item.site_name;
	if(fullSiteName.toString().indexOf("Google") == 0) {
		fullSiteName = "";
	}
	var siteName = newsSource.optimizeSiteName(item.site_name);
	Ti.API.debug("siteName1====" + siteName + ", link=" + link);
	if('UrawaReds' == siteName) {
		siteName = newsSource.getSiteName(link);
		fullSiteName = siteName;
		Ti.API.info("   UrawaReds. siteName====" + siteName + ", link=" + link);
	}
	var siteNameLabel = Ti.UI.createLabel(style.news.siteNameLabel);
	siteNameLabel.text = siteName + "   " + pubDateText;
	// row情報セット
	rowView.add(siteNameLabel);
	row.add(rowView);
	row.fullSiteName = fullSiteName;
	row.siteName = siteName;
	row.pageTitle = itemTitle;
    row.pageTitleFull = itemTitleFull;
	row.link = link;
	row.content = content;
	row.image = imgUrl;
	row.pubDate = pubDateText;
    return row;
}

/**
 *  日付をパースして返す
 */
function parseDate(str){// str==yyyy-mm-ddThh:mm:ssZ
    //strdate==YYYY/mm/dd hh:mm:ss
    //var strDate = str.split('\+')[0].replace('T',' ').replace('-','\/').replace('-','\/').replace('Z','');
    var date = new Date(str);
    var time = date.getTime()/* + 32400000*/;
    date.setTime(time);
    return date;
};

/**
 * DBに既読URLを保存する
 */
function saveVisitedUrl(url) {
    var date = util.formatDate();
    var db = Ti.Database.open('urawareds.my.life');
    try {
        db.execute('INSERT INTO visitedUrl(url, date) VALUES(?, ?)', url, date);
    } finally{
        db.close();
    }
}

/**
 * DBから既読URLリストを返す
 */
function getVisitedUrlList() {
    Ti.API.info('■getVisitedUrlList');
    var db = Ti.Database.open('urawareds.my.life');
    var urlList = new Array();
    try {
        var rows = db.execute('SELECT url, date FROM visitedUrl');
        while (rows.isValidRow()) {
            urlList.push(rows.field(0));
            Ti.API.info('既読　######## ' + rows.field(1) + " : " + rows.field(0));
            // Ti.API.info('Person ---> ROWID: ' + rows.fieldByName('rowid') 
                // + ', name:' + rows.field(1) + ', phone_number: ' 
                // + rows.fieldByName('phone_number') + ', city: ' + rows.field(3));
            rows.next();
        }
    } finally{
        db.close();
    }
    return urlList;
}

module.exports = News;
