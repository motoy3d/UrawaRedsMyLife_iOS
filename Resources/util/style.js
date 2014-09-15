exports.style = {
	common : {
	    barColor : 'red',
        navTintColor : 'white',
		loadingMsg : '読み込み中...',
		offlineMsg : 'ネットワークに接続できません。\n接続後に再度お試しください。',
		loadingFailMsg : '読み込みに失敗しました',
		noDataMsg : '該当データが見つかりませんでした',
		noMovieMsg : '動画が見つかりませんでした',
		mainTextColor : 'white',
		rowBgSelectedColor : "#f66",
		indicator : {
			font: {
				fontSize : 17,
				fontWeight : 'bold'
			},
			color: 'white',
			message: '読み込み中...'			
		}
	},
	news : {
	    table : {
	        backgroundColor: 'black'
            ,separatorColor: '#666'
	    },
		tableViewRow : {
			layout : 'horizontal',
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
//			hasDetail : true,
			backgroundSelectedColor : "#f66",
            className : 'newsTableRowContent',
			type: 'CONTENT'
		},
		rowView : {
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE
            ,layout : 'horizontal'
		},
		titleLabel : {
			color : "white",
			font : {fontSize : 16},
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			top : 10,
			bottom : 0,
			left : 7,
			right : 4
		},
        imgView : {
            width: 120,
            //height: 150,
            //top : 10,
            //left : 4,
            hires: true
        },
        imgViewContainer : {
            width: 120,
            height: 120,
            top : 10,
            left : 4,
            hires: true
        },
		siteNameLabel : {
			color : "lightgray",
			font : {fontSize : 14},
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			top : 0,
			bottom : 10,
			right : 10,
			textAlign : 'right'			
		},
		loadMoreLabel : {
			color : 'white',
			font : {fontSize : 16},
			top : 25,
			left : 100			
		},
		loadMoreRow : {
			layout : 'vertical',
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			backgroundSelectedColor: "#f66",
			type: 'LOAD_MORE'
		},
		loadMoreImg : {
			image : "images/loadMore.png",
			width: 64,
			height: 64,
			top : 15,
			left : 10
		},
		tableHeader : {
            backgroundColor: "black",
            width:320,
            height:60    
		},
		arrow : {
            backgroundImage:"/images/whiteArrow.png",
            width:23,
            height:60,
            bottom:10,
            left:20		    
		},
		statusLabel : {
            text:"ひっぱって更新",
            left:55,
            width:200,
            bottom:30,
            height: Ti.UI.FILL,
            color: "dddddd",
            textAlign:"center",
            font:{fontSize:13,fontWeight:"bold"}
		},
		tableBorder : {
            backgroundColor:"#576c89",
            height:2,
            bottom:0
		},
		lastUpdatedLabel : {
            left: 55,
            width:200,
            bottom:15,
            height:"auto",
            color:"#dddddd",
            textAlign:"center",
            font:{fontSize:12}
		},
		refreshActIndicator : {
            left:20,
            bottom:13,
            width:30,
            height:30
		},
		visitedBgColor : '#457'
	},
    config : {
        window : {
            title: "設定・シェア"
            ,navBarHidden: false
            ,backgroundColor: "black"
            ,navTintColor: "white"
        },
        tableView : {
            backgroundColor: "black"
            ,separatorColor: '#888'
            //,separatorColor: 'black'
            ,allowsSelection: true
            ,scrollable: false
            ,top: 0
            ,width: Ti.UI.FILL
            ,height: Ti.UI.SIZE
        },
        lineRow : {
            title: "友達にLINEですすめる"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        mailRow : {
            title: "友達にメールですすめる📩"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        twitterRow : {
            title: "twitterでつぶやく"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        fbRow : {
            title: "facebookでシェア"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        },
        appReviewRow : {
            title: "レビューを書く(お願い🌟)"
            ,color: "white"
            ,width: Ti.UI.FILL
            ,hasChild: true
            ,height: 50
        }
    },
	results : {
	    table : {
	        backgroundColor: 'black',
	        separatorColor: 'gray'
	    },
		tableViewRow : {
			height : 'auto',
			backgroundColor : 'black',
//			backgroundSelectedColor : "#f66",
			className : 'resultsTableRow',
			type: 'CONTENT'
		},
		dateLabel : {
			width : 135,
			color : 'lightgray',
			font : {fontSize : 13},
			height : 24,
			top : 4,
			left : 4			
		},
		compeLabel : {
			color : 'lightgray',
			font : {fontSize : 13},
			width : 160,
			height : 24,
			top : 4,
			left : 155			
		},
		stadiumLabel : {
			width : 200,
			color : 'lightgray',
			font : {fontSize : 13},
			top : 26,
			left : 5			
		},
		teamLabel : {
			width : 210,
			color : 'white',
			font : {fontSize : 19},
			top : 51,
			// bottom : 10,
			left : 5			
		},
		resultLabel : {
			width : 32,
			height : 32,
			top : 46,
			right : 60			
		},
		scoreLabel : {
			color : 'white',
			font : {fontSize : 25},
			height : "auto",
			top : 48,
			// bottom : 10,
			right : 10			
		},
		detailButton : {
			backgroundImage : '/images/gameDetailBtn.png',
			backgroundSelectedImage : '/images/gameDetailSelectedBtn.png',
			color : 'white',
			font : {fontSize : 17},
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 112 //元々90			
		},
		movieButton : {
			backgroundImage : '/images/movieSearchBtn.png',
			backgroundSelectedImage : '/images/movieSearchSelectedBtn.png',
			color : 'white',
			font : {fontSize : 17},
			width : 84,
			height : 37,
			top : 90,
			bottom : 8,
			right : 10			
		}
	},
	standings : {
	    backgroundColor : "red",
	    standingsView : {
	        top : 0
	        ,backgroundColor: "black"
	    },
	    table : {
            top: 37
            ,allowsSelection: false
            ,separatorColor: '#666'
            ,backgroundColor: "black"
	    },
	    headerView : {
	        top: 0
	        ,backgroundColor: 'black'
	    },
	    headerLabel : {
            height: 33,
            top : 1,
            backgroundColor: 'black',
            color: 'white'	        
	    },
	    border : {
            width: Ti.UI.FILL,
            height: 1,
            top: 34
            ,borderWidth: 1
            ,borderColor: '#999'	        
	    },
	    tableViewRow : {
            height: 28
            ,color: 'white'
            ,backgroundColor: 'black'
            ,className: "standingsTableRow"
	    },
	    compeButtonBar : {
	        style: Ti.UI.iPhone.SystemButtonStyle.BAR
	        ,backgroundColor: 'red'
            ,tintColor: 'red'
            ,width: 200
	    }
	},
	twitter : {
	    webWindow : {
            backgroundColor: 'black'
            ,barColor: 'red'
            ,navTintColor: 'white'
//            navBarHidden: true  
	    },
        webWindowToolbar : {
            bottom: 0
            ,borderTop: true
            ,borderBottom: true
            ,backgroundColor: '#29b'        
        },
	    listView : {
	        separatorColor: '#666'
	        ,allowsSelection: true
	        ,backgroundColor: "black"
	    },
        listViewTemplate : [
            {
                type: 'Ti.UI.Label',
                bindId: 'userName',    //名前ラベル
                properties: {
                    color: '#fff'
                    ,backgroundColor: '#000'
                    ,font: {fontSize: 16, fontWeight: 'bold'}
                    ,top: 4
                    ,left: 60
                }
            },
            {
                type: 'Ti.UI.ImageView',
                bindId: 'userProfileImage',    //プロフィール画像
                properties: {
                    top: 6
                    ,left: 6
                    ,width: 48
                    ,height: 48
                    ,borderRadius: 5
                    ,backgroundColor: '#000'
                }
            },
            {
                type: 'Ti.UI.View',
                bindId: 'contentView',
                properties: {
                    top: 42
                    ,left: 60
                    ,right: 6
                    ,height: Ti.UI.SIZE
                    ,backgroundColor: '#000'
                },
                childTemplates: [
                    {
                        // iOSではLabelにリンクがつけられない
                        type: 'Ti.UI.Label',
                        bindId: 'content',
                        properties: {
                            color: '#fff'
                            ,backgroundColor: '#000'
                            ,font: {fontSize: 16}
                            ,top: 0
                            ,left: 0
                            ,bottom: 260
                            ,height: Ti.UI.SIZE
                        }
                    },
                    {
                        type: 'Ti.UI.ImageView',
                        bindId: 'postImage',    //投稿内画像
                        properties: {
                            top: 0,
                            width: Ti.UI.SIZE
                            ,left: 0
                            ,bottom: 6
                            ,height: 250
                            ,backgroundColor: '#000'
                        },
                        events: {
                            load: function(e){var util = require("/common/util").util; Ti.API.info('■■■image loaded. ' + util.toString(e.source));},
                            error: function(e){
                                var util = require("/common/util").util;
                                Ti.API.error('■■■画像読み込みエラー　 ' + util.toString(e.source));
                            }
                        }
                    }
                ],
            },
            {
                type: 'Ti.UI.Label',
                bindId: 'time',    //日時ラベル
                properties: {
                    color: '#ddd'
                    ,backgroundColor: '#000'
                    ,font: {fontSize: 12}
                    ,top: 24
                    //,bottom: 8
                    ,right: 6
                }
            },
        ],
        /* Android用ツールバー */
        listViewRefreshTemplate : [
            {
                type: 'Ti.UI.ImageView',
                bindId: 'refreshImage',
                properties: {
                    right: 10
                    ,width: 40
                    ,height: 40
                }
            },
            {
                type: 'Ti.UI.Label',
                bindId: 'translate',
                properties: {
                    text: L('TranslateBtn')
                    ,left: 10
                    ,color: '#6cf'
                }
            }
        ],
	    
		tableViewRow : {
			height : Ti.UI.SIZE
			,backgroundColor : "black"
			,backgroundSelectedColor : "red"
            ,className: "twitterTableRow"
			,type: 'CONTENT'			
		},
		profileImg : {
			backgroundColor: 'white',
			width: 48,
			height: 48,
			top : 10,
			left : 2			
		},
		userNameLabel : {
			color : 'white',
			font : {
				fontSize : 15,
				fontWeight: 'bold'
			},
			height : 17,
            width : Ti.UI.FILL,
			top : 5,
			left : 58			
		},
		textLabel : {
			color : 'white',
			font : {fontSize : 15},
			height : Ti.UI.SIZE,
            width : Ti.UI.FILL,
			top : 28,
			left : 70,
			bottom : 24
		},
		timeLabel : {
		    /*color : "#d87",*/
		   color : "lightgray",
            font : {fontSize : 13},
            height : Ti.UI.SIZE,
            bottom : 5,
            left : 70
		},
		loadingRow : {
		    color: 'white'
		    ,backgroundColor : 'black'
            ,width: Ti.UI.FILL
            ,height: 50
		},
        loadingIndicator : {
            color: 'white'
            ,backgroundColor : 'black'
            ,width: Ti.UI.FILL
            ,height: 50
        },
        tableHeader : {
            backgroundColor: "black",
            width:320,
            height:60    
        },
        arrow : {
            backgroundImage:"/images/whiteArrow.png",
            width:23,
            height:60,
            bottom:10,
            left:20         
        },
        statusLabel : {
            text:"ひっぱって更新",
            left:55,
            width:200,
            bottom:30,
            height: Ti.UI.FILL,
            color: "dddddd",
            textAlign:"center",
            font:{fontSize:13,fontWeight:"bold"}
        },
        tableBorder : {
            backgroundColor:"#576c89",
            height:2,
            bottom:0
        },
        lastUpdatedLabel : {
            left: 55,
            width:200,
            bottom:15,
            height:"auto",
            color:"#dddddd",
            textAlign:"center",
            font:{fontSize:12}
        },
        refreshActIndicator : {
            left:20,
            bottom:13,
            width:30,
            height:30
        }
	}
};
