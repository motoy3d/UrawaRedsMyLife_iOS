function ApplicationTabGroup(Window) {
	var NewsWindow = require('ui/handheld/NewsWindow');
	var ResultsWindow = require('ui/handheld/ResultsWindow');
	var StandingsWindow = require('ui/handheld/StandingsWindow');
	var TwitterWindow = require('ui/handheld/TwitterWindow');

	//create module instance
	var self = Ti.UI.createTabGroup();
	
	//create app tabs
	var win1 = new NewsWindow(self),
		win2 = new ResultsWindow(self),
		win3 = new StandingsWindow(self),
		win4 = new TwitterWindow(self)
		;
	// ニュース
	var tab1 = Ti.UI.createTab({
		title: L('news'),
		icon: '/images/news.png',
		window: win1
	});
	// 日程・結果
	var tab2 = Ti.UI.createTab({
		title: L('results'),
		icon: '/images/game.png',
		window: win2
	});
	win2.containingTab = tab2;
	// 順位表
	var tab3 = Ti.UI.createTab({
		title: L('standings'),
		icon: '/images/standings.png',
		window: win3
	});
	win3.containingTab = tab3;
	// twitter
	var tab4 = Ti.UI.createTab({
		title: L('twitter'),
		icon: '/images/twitter.png',
		window: win4
	});
	win4.containingTab = tab4;
	
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	self.addTab(tab4);
	
	return self;
};

module.exports = ApplicationTabGroup;
