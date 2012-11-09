$(function(){
	/*chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse){
			if(request.msg === 'msg_to_Bg')
				alert("Message received in Background !" + request.msg);
		}
	);
	*/
	
	init();
});

function init(){
	var tableName = util.getActiveTable().name;
	// TIMER Initialization
	if(ls.get('learnedTreshold') !== '0'){ // 0min means no repetition
		/*var t=setInterval(function() {
			notification.show();
		
		}, settings.get('sessionFreq') * 60 * 1000);*/
		
		setTimeout(function() {
			if (typeof tableName !== 'undefined' && tableName !== "" && tableName !== null){
				notification.show();
				console.log('[Info] Should show notification to practice from active table ' + tableName);
			} else {
				chrome.tabs.create({url: chrome.extension.getURL('options.html#settingsTab')});
				console.log('[Info] There is no active table: '+ tableName + '. Opening options page to create one.');
			}
		},0.5 * 1000);
	}

}
var notification = {
	window:'',
	nFetchedWords: 0,
	show: function(){
		this.closeAll();
		
		this.window = webkitNotifications.createHTMLNotification(
			'notification.html'
		);
		practice.fetchSessionData(this.showCallback);
		
		this.window.ondisplay = function(ev){
			//console.log("ondisplay");
			practice.closeAll();
		};	
		this.window.onclose = function(){
			//console.log("onclose");
		};
		this.window.onerror= function(){
			//console.log("onerror");
		};
		//this.window.show();
		
	},
	showCallback: function(){
		notification.nFetchedWords = practice.sessionData.length;
		notification.window.show();
	},
	closeAll: function(){ // close ALL previous notifications
		chrome.extension.getViews({type:"notification"}).forEach(function(win) {
			win.close();
		});
	}
}

// timerEnds->fetchDataFromDb->OpenNotification->onClickStartPractice->openPracticeTab->sendFetchedData
var practice = {
	openedTabsId: new Array(),
	sessionData: new Array(),
	start: function(){
		practice.closeAll();
		practice.newTab();									
	},
	newTab: function(){
		chrome.tabs.create({'url': chrome.extension.getURL('practice.html')}, function(tab) {
			practice.openedTabsId.push(tab.id);
			console.log('tab created with id: ' + tab.id);
			//practice.sendSessionData();
		});
	},
	addWords: function(){
		chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
			console.log('tab created with id: ' + tab.id);
			practice.openedTabsId.push(tab.id);
		});
	},
	closeAll: function(){ // close all practice tabs
		if (this.openedTabsId.length > 0){
			chrome.tabs.remove(this.openedTabsId, function(){
				console.log('Tabs to be removed: ' + practice.openedTabsId );
				practice.openedTabsId = [];	
			});
			
		}
	},
	fetchSessionData: function(callback){
		var nWords = ls.get('wordsPerSession');
		console.log('[Info] Should be fetched ' + nWords + ' words.');
		db.tx({name: 'get_n_where', colName: 'state', colVal: 'active', limit: nWords}, function(tx, rs){
			var nActiveRows;
			
			practice.sessionData = []; // clear the array
			nActiveRows = rs.rows.length;
			
			for (var i = 0; i < nActiveRows; i++) {
				practice.sessionData.push( rs.rows.item(i)); 								// put new (state: active) element in the array
			}

			if (nActiveRows === nWords){
				callback();
				console.log('[Info] There are ' + rs.rows.length + ' fetched  words to practice with state ACTIVE');
			} else {
				db.tx({name: 'get_n_where', colName: 'state', colVal: 'waiting', limit: (nWords - nActiveRows)}, function(tx, rs){ 
					// callback for 'waiting' rows 
					for (var i = 0; i < rs.rows.length; i++) {
						practice.sessionData.push( rs.rows.item(i)); 								// put new element in the array
						db.tx({ // set state in the db to 'active'
							name: 'edit_entry', 
							editedColumn: 'state',  
							newValue: 'active', 
							id: rs.rows.item(i).id
						}, []);

					}
					callback();
					console.log('[Info] There are ' + rs.rows.length + ' fetched  words to practice with state WAITING');
				}); 
			}
		});
	
	},
	sendSessionData: function(){	// is called from practice tab
		console.log('[Info] sending data to tab' );
		chrome.tabs.getSelected(null, function(tabs){
			chrome.tabs.sendMessage(tabs.id, {action: 'sessionDataArray', data: practice.sessionData});
		
		});
	}
}


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action === 'sendSessionData'){  // Called from practice page in order to send the data
		practice.sendSessionData();
	} else if (request.action === 'addWordToDict') {
		console.log('should add word' + request.word);
		db.tx({	name: 'add_entry', 
				word: request.word,
				translation: request.translation,
				description: request.example
			}, []);
	} else if (request.action === 'getLangInfo'){
		console.log('should detect tab Language');
		chrome.tabs.getSelected(null, function(tab){
			chrome.tabs.detectLanguage(tab.id, function(language) {
				console.log(language);
				chrome.tabs.sendMessage(tab.id, {action: 'langInfo', tabLang: language, iSpeak: util.getActiveTable().iSpeak, iLearn: util.getActiveTable().iLearn});
			});
			
		});
	}
});


var util = {
	isOnline: function(){
		"use strict"
		return navigator.onLine;
	},
	getActiveTable: function(){
		return ls.get('activeTable');
	}

}

/*
chrome.tabs.getSelected(null, function(tab) {
  chrome.tabs.detectLanguage(tab.id, function(language) {
    console.log(language);
  });
});
*/





// Called when the user clicks on the browser action.
/*chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({url: chrome.extension.getURL('options.html')});
});*/


//menu: function() {
	//console.log(localStorage['menu_id']);
	//chrome.contextMenus.remove(parseInt(localStorage['menu_id']));
	var id = chrome.contextMenus.create({
		title: 'New Word', 
		onclick: function(info, tab) {
			if (info.pageUrl.match(/https:\/\/chrome.google.com\/[extensions|webstore]/i)){
				return alert('Lingvo Tutor can\'t add words from thos page.');
			} else if (info.selectionText.length){
				console.log(info);
				
				//chrome.tabs.create({url: chrome.extension.getURL('options.html#addWordTab#'+info.selectionText)});
			}
			
		}, 
		contexts:['all']
	});
	//console.log(id);
	//localStorage['menu_id'] = id;
	//util.menu = function() { return id; };
	//return id;
//}
















/*	
var data1 = {
	var1: "somedata",
	var2: 12345
} 
var data2 = {
	var1: "somedata",
	var2: 12345
} 


var util = {
	// db[id, columnName] = newValue
	editDbRow: function(rowId, newValue, columnName, callback){
		db.tx({ // store edited row to db
			name: 'edit_entry', 
			editedColumn: columnName,  
			newValue: newValue, 
			id: rowId
		}, callback);
	
	}
}
*/

















/*
var practice = {
	table: new Array(),
	start: function(){
		// close ALL previous notifications
		chrome.extension.getViews({type:"notification"}).forEach(function(win) {
			win.close();
		});
		chrome.extension.getBackgroundPage().db.tx({name: 'get_n_where_state', state: 'active', limit: '20'}, practice.startCallback); // load session
	},
	startCallback: function(tx, rs){
		practice.table = []; // clear the array
		var nActiveRows = rs.rows.length;

		for (var i = 0; i < nActiveRows; i++) {
			practice.table.push( rs.rows.item(i)); 								// put new (state: active) element in the array
		}
		
		if (nActiveRows === 20){	// TODO: substitute 20 with locally stored variable
			practice.triggerNotification();	// there are sufficient number of fetched rows
		}else{
			chrome.extension.getBackgroundPage().db.tx({name: 'get_n_where_state', state: 'waiting', limit: (20-nActiveRows)}, function(tx, rs){
				// callback for 'waiting' rows 
				for (var i = 0; i < rs.rows.length; i++) {
					practice.table.push( rs.rows.item(i)); 								// put new element in the array
					util.editDbRow(rs.rows.item(i).id, 'active', 'state', []);			// set state in the db to 'active'
				}
				practice.triggerNotification();
			}); 
		}
		console.log(practice.table);
	}, 
	triggerNotification: function(){
		var notification = webkitNotifications.createHTMLNotification(
			'practice.html#' + JSON.stringify(practice.table)
		);
		notification.ondisplay = function(ev){
			console.log("ondisplay");
		};	
		notification.onclose = function(){
			console.log("onclose");
		};
		notification.onerror= function(){
			console.log("onerror");
		};
		notification.show();
	}

}
*/
