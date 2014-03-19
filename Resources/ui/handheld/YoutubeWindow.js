
/**
 * Youtube動画一覧を表示するウィンドウ
 * @param {Object} searchCond
 */
function YoutubeWindow(searchCond) {
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var self = Ti.UI.createWindow({
        title: searchCond.title
        ,backgroundColor: 'white'
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
//        navBarHidden: true
    });
    // function
    self.searchYoutube = searchYoutube;
    var vsTeam;
    // create table view data object
    var data = [];
    var maxResults = 30;
    var startIndex = 1;
    // インジケータ
    var ind = Ti.UI.createActivityIndicator();
    self.add(ind);
    self.addEventListener('open',function(e) {
        searchYoutube();
    });

    var tableView = Ti.UI.createTableView({
        data : data,
        backgroundColor : "#000000",    //TODO style
        separatorColor : "#000000"
    });

    self.add(tableView);
    tableView.addEventListener('click', function(e) {
        Ti.API.info('>>>>>>>>>> click');
        playYouTube(e.row.videotitle, e.row.guid);
    });

    /**
     * Youtubeで検索し、一覧表示する。
     */
    function searchYoutube() {
//alert("searchYoutube");
        // オンラインチェック
        if(!Ti.Network.online) {
            util.openOfflineMsgDialog();
            return;
        }
        ind.show();
        try {
            vsTeam = searchCond.team;
            var searchTerm1 = searchCond.key1;
            var searchTerm2 = searchCond.key2;
            var searchTerm3 = searchCond.key3;
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
            var searchUrl3 = null;
            if(searchTerm3) {
                searchUrl3 = searchUrlBase.replace(replaceKey, searchTerm3);
            }
    
            var youtubeFeedQuery = "SELECT title,pubDate,link,statistics.viewCount FROM feed WHERE " 
                + "url='" + searchUrl + "'";
            if(searchUrl2) {
                youtubeFeedQuery += " or " + "url='" + searchUrl2 + "'";
            }
            if(searchUrl3) {
                youtubeFeedQuery += " or " + "url='" + searchUrl3 + "'";
            }
            Ti.API.info("■YQL Query........" + youtubeFeedQuery);
//alert(youtubeFeedQuery);
            Ti.Yahoo.yql(youtubeFeedQuery, function(e) {
                try {
                    if(e.data == null) {
Ti.API.info('e.data is null');
//alert("e.data is null");
                        //indicator.hide();
                        ind.hide();
                        var row = Ti.UI.createTableViewRow({
                            height : 80,
                            backgroundSelectedColor : "#f33"
                        });
                        row.text = style.common.noDataMsg;
                        tableView.appendRow(row);
                        return;
                    }
    //                for(var i=0; i<e.data.item.length; i++) {
    //                  Ti.API.info('#### ' + i + '=' + util.toString(e.data.item[i]));
    //                }
                    var rowsData;
                    //TODO なぜか配列でないと判定されてしまうのでjoinメソッド有無で配列判定。
                    if(e.data.item.join) {
Ti.API.info('>>>> 結果複数件　map');
                        rowsData = e.data.item.map(createYoutubeRow);
                    } else {
Ti.API.info('>>>> 結果1件');
                        rowsData = new Array(createYoutubeRow(e.data.item));
                    }
    //              Ti.API.info('>>>>> map完了');
//alert("map完了");
Ti.API.info('tableView.setData(rowsData)');
                    tableView.setData(rowsData);
                    startIndex += maxResults;
Ti.API.info('ind.hide() 1');
                    ind.hide();
                } catch(e1) {
                    ind.hide();
                    Ti.API.error('youtube読み込みエラー1：' + e1);
//alert("エラー１: " + e1);                 
                } finally {
//alert("finally");
//finally内の処理が効かない？
                }
                Ti.API.info('ind.hide() last');
                ind.hide();
            });
        } catch(e2) {
            Ti.API.error('youtube読み込みエラー2：' + e2);
            ind.hide();
        }
    }

    /**
     * TableViewRowを生成して返す
     */
    function createYoutubeRow(item/*, index, array*/) {
        // try {
            Ti.API.info('###### createYoutubeRow() title=' + item.title);
            var title = item.title;
            if(title.indexOf(util.getTeamName()) == -1 && title.indexOf(vsTeam) == -1
               && title.indexOf(searchCond.date) == -1) { 
                //タイトルに「浦和」、対戦相手チーム名がないのは削除
                Ti.API.info('タイトルに「' + util.getTeamName() + '」、対戦相手チーム名(' + vsTeam + ')、日付がないのは削除 [' + title + ']');
                return null;
            }
            var summary = "";
            if(item.pubDate) {
                var pubDate = new Date(item.pubDate);
                var minutes = pubDate.getMinutes();
                if(minutes < 10) {
                    minutes = "0" + minutes;
                }
                var viewCount = "";
                if(item.statistics) {
                    viewCount = item.statistics.viewCount + "回再生    ";
                }
                summary = viewCount
                    + (pubDate.getMonth() + 1) + "/" 
                    + pubDate.getDate() + " " + pubDate.getHours() + ":" + minutes;
            }
            var link = item.link;
        
            var guid = link.substring(link.indexOf("?v=") + 3);
            guid = guid.substring(0, guid.indexOf("&"));
        
            var thumbnail = "http://i.ytimg.com/vi/" + guid + "/2.jpg";
        
            var row = Ti.UI.createTableViewRow({
                height : 90,
        //      backgroundSelectedColor : "#f33",
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
        // } catch(ex) {
            // Ti.API.info('Youtube読み込み時エラー : ' + ex);
        // }
    }
    
    /**
     * 動画を再生する
     */
    function playYouTube(vtitle, vguid) {
        Ti.App.Analytics.trackPageview('/playMovie');
        Ti.API.info('------- playYouTube.. ' + Ti.Platform.name);
        var movieUrl = "http://www.youtube.com/embed/" + vguid + "?fs=1&autoplay=1";
        var videoView = Ti.UI.createWebView({
            url : movieUrl
        });
        var videoWin = Ti.UI.createWindow({
            barColor: style.common.barColor
        });
        videoWin.add(videoView);
        Ti.App.tabGroup.activeTab.open(videoWin, {
            animated : true
        });
    }
    return self;
}
module.exports = YoutubeWindow;
