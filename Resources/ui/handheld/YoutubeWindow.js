
/**
 * Youtube動画一覧を表示するウィンドウ
 * @param {Object} youtubeData
 */
function YoutubeWindow(youtubeData) {
	var util = require("util/util").util;
	var style = require("util/style").style;

	var self = Ti.UI.createWindow({
		title: youtubeData.title,
		backgroundColor: 'white'
		,barColor: 'red'
	});
	// function
	self.searchYoutube = searchYoutube;

	var keyword1 = youtubeData.key1;
	var keyword2 = youtubeData.key2;
	// create table view data object
	var data = [];
	var maxResults = 25;
	var startIndex = 1;
	var webModal;
	var webModalView;
	var indicator = Ti.UI.createActivityIndicator();
	indicator.show();

	var tableView = Ti.UI.createTableView({
		data : data,
		backgroundColor : "#000000",	//TODO style
		separatorColor : "#000000",
		top : 2
	});

	self.add(tableView);
	tableView.addEventListener('click', function(e) {
		Ti.API.info('>>>>>>>>>> click');
		playYouTube(e.row.videotitle, e.row.guid);
	});

	/**
	 * Youtubeで検索し、一覧表示する。
	 */
	function searchYoutube(searchTerm1, searchTerm2) {
		// オンラインチェック
		if(!Ti.Network.online) {
			indicator.hide();
			util.openOfflineMsgDialog();
			return;
		}
        Ti.App.Analytics.trackPageview('/movieList');
		var replaceKey = '#キーワード#';
        var searchUrlBase = 'http://gdata.youtube.com/feeds/api/videos?alt=rss&q='
            + replaceKey
            + '&max-results=' + maxResults + '&start-index=' + startIndex
            + '&orderby=published'  //relevance（関連度が高い順）、published（公開日順）、viewCount（再生回数順）、rating（評価が高い順） 
            + '&v=2';
	
		var searchUrl = searchUrlBase.replace(replaceKey, searchTerm1);
		var searchUrl2 = null;
		if(searchTerm2) {
			searchUrl2 = searchUrlBase.replace(replaceKey, searchTerm2);
		}
		indicator.show();

        var youtubeFeedQuery = "SELECT title,pubDate,link,statistics.viewCount FROM feed WHERE " 
            + "url='" + searchUrl + "'";
		if(searchUrl2) {
			youtubeFeedQuery += " or " + "url='" + searchUrl2 + "'";
		}
		Ti.API.info("■YQL Query........" + youtubeFeedQuery);
		
		Ti.Yahoo.yql(youtubeFeedQuery, function(e) {
			try {
				if(e.data == null) {
					indicator.hide();
					var row = Ti.UI.createTableViewRow({
						height : 80,
						backgroundSelectedColor : "#f33"
					});
					row.text = style.common.noDataMsg;
					tableView.appendRow(row);
					return;
				}
				for(var v in e.data.item) {
//					Ti.API.info('$$$$$$$$$$ ' + v + '=' + e.data.item[v]);
				}
				Ti.API.info('e.data.itemは配列？ ' + (e.data.item instanceof Array));
				var rowsData;
				if(e.data.item instanceof Array) {
					rowsData = e.data.item.map(createYoutubeRow);
				} else {
					rowsData = new Array(createYoutubeRow(e.data.item));
				}
				Ti.API.info('>>>>> map完了');
				// 2回目以降の追加ロード時
				if(tableView.data[0] && 0 < tableView.data[0].rows.length) {
					// var lastRow = tableView.data[0].rows.length - 1;
					// tableView.deleteRow(lastRow, null);
					// var scrollToIdx = tableView.data[0].rows.length;
					// for(i=0; i<rowsData.length; i++) {
						// if(i == 0) {
							// newsInd.hide();
						// }
						// tableView.appendRow(rowsData[i]);
					// }
					// tableView.scrollToIndex(scrollToIdx, null);
				} else {
					// 初回ロード時
					tableView.setData(rowsData);
				 }
	 			startIndex += maxResults;
				indicator.hide();
			} catch(e) {
				indicator.hide();
			}
		});
		// Ti.API.debug("youtube: " + searchUrl);
	}

	/**
	 * TableViewRowを生成して返す
	 */
	function createYoutubeRow(item/*, index, array*/) {
		Ti.API.info('###### createYoutubeRow() title=' + item.title);
		var title = item.title;
	
		var summary = "";
		if(item.pubDate) {
			var pubDate = new Date(item.pubDate);
			var minutes = pubDate.getMinutes();
			if(minutes < 10) {
				minutes = "0" + minutes;
			}
            summary = item.statistics.viewCount + "回再生    "
                + (pubDate.getMonth() + 1) + "/" 
                + pubDate.getDate() + " " + pubDate.getHours() + ":" + minutes
                ;
		}
	
		var link = item.link;
	
		var guid = link.substring(link.indexOf("?v=") + 3);
		guid = guid.substring(0, guid.indexOf("&"));
	
		var thumbnail = "http://i.ytimg.com/vi/" + guid + "/2.jpg";
	
		var row = Ti.UI.createTableViewRow({
			height : 90,	
			type : "CONTENT"
		});
	
		row.url = link;
		row.guid = guid;
		row.videotitle = title;
		row.backgroundColor = "#000000";
		row.color = "#ffffff";
        //TODO	
		var labelTitle = Ti.UI.createLabel({
            text : title,
            left : 130,
            right : 10,
            top : 5,
            height : 50,
            font : {
                fontSize : 14
            },
            color : "#ffffff"
		});
		row.add(labelTitle);
	
		var labelSummary = Ti.UI.createLabel({
            text : summary,
            left : 130,
            right : 10,
            bottom : 9,
            font : {
                fontSize : 13
            },
            color : "#ffffff"
		});
		row.add(labelSummary);
	
		var img = Ti.UI.createImageView({
			image : thumbnail,
			left : 0,
			height : 90,
			width : 120
		});
		row.add(img);
	
		return row;
	}
	
	/**
	 * WEB用ウィンドウを生成して返す。
	 * ※WebViewではなく、Window
	 */
	function createWebView() {
Ti.API.debug('-------createWebView 1');	

		webModal = Ti.UI.createWindow({
		    barColor: 'red'
		});
	
		webModal.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT];
		webModalView = Ti.UI.createWebView();
		webModalView.scalesPageToFit = true;
Ti.API.debug('-------createWebView 4');	
	
		webModal.add(webModalView);
	
		webModalView.addEventListener('beforeload', function(e) {
			Ti.API.debug("webview beforeload: " + e.url);
			indicator.show();
		});
	
		webModalView.addEventListener('load', function(e) {
			Ti.API.debug("webview loaded: " + e.url);
			indicator.hide();
		});
Ti.API.debug('-------createWebView 7');	
		return webModalView;
	}
	
	/**
	 * 動画を再生する（内部でiPhone/Androidの処理分岐あり）
	 */
	function playYouTube(vtitle, vguid) {
        Ti.App.Analytics.trackPageview('/playMovie');
		Ti.API.info('------- playYouTube.. ' + Ti.Platform.name);
		if(Ti.Platform.name == 'iPhone OS') {
            var movieUrl = "http://www.youtube.com/embed/" + vguid + "?fs=1&autoplay=1";

            // var videoWin = Ti.UI.createWindow({
                // barColor: 'red'
            // });
    // var activeMovie = Titanium.Media.createVideoPlayer({
        // url: movieUrl,
        // backgroundColor:'#111',
        // mediaControlStyle:Titanium.Media.VIDEO_CONTROL_DEFAULT, // See TIMOB-2802, which may change this property name
        // scalingMode:Titanium.Media.VIDEO_SCALING_MODE_FILL
    // });
//     
    // if (parseFloat(Titanium.Platform.version) >= 3.2)
    // {
        // videoWin.add(activeMovie);
    // }
//     
    // activeMovie.play();
//     
    // videoWin.addEventListener('close', function() {
        // activeMovie.stop();
    // });
            // Ti.App.tabGroup.activeTab.open(videoWin, {
                // animated : true
            // });

            var videoView = Ti.UI.createWebView({
            	url : movieUrl
            });
            var videoWin = Ti.UI.createWindow({
                barColor: 'red'
            });
            videoWin.add(videoView);
            Ti.App.tabGroup.activeTab.open(videoWin, {
            	animated : true
            });
		} else {
			Ti.API.info('openURL.....');
			Ti.Platform.openURL('http://www.youtube.com/watch?v=' + vguid);
		}
	}
	
	/**
	 * modalウィンドウにhtmlを表示する
	 * ※iOSで動画再生時にも使用
	 */
	function showHTMLContent(wTitle, wUrl, wHTMLContent) {
		Ti.API.info("showHTMLContent: " + wHTMLContent);
		// currentLink = wUrl;
	
		createWebView();
Ti.API.info('-------webModal=' + webModal);	
		webModal.title = wTitle;
	
		webModalView.html = wHTMLContent;
		Ti.App.tabGroup.activeTab.open(webModal, {
			animated : true
		});
	}
	return self;
}
module.exports = YoutubeWindow;
