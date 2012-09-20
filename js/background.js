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

	/*var t=setInterval(function() {
		notification.show();
	
	}, 10 * 1000);*/
	
	setTimeout(function() {
		notification.show();
	},0.5 * 1000);

}
var notification = {
	notification:'',
	show: function(){
		this.closeAll();
		
		this.notification = webkitNotifications.createHTMLNotification(
			'notification.html'
		);
		this.notification.ondisplay = function(ev){
			//console.log("ondisplay");
			practice.closeAll();
		};	
		this.notification.onclose = function(){
			//console.log("onclose");
		};
		this.notification.onerror= function(){
			//console.log("onerror");
		};
		this.notification.show();
		
	},
	closeAll: function(){
		// close ALL previous notifications
		chrome.extension.getViews({type:"notification"}).forEach(function(win) {
			win.close();
		});
	}
}


var practice = {
	openedTabsId: new Array(),
	sessionData: new Array(),
	newTab: function(){
		chrome.tabs.create({'url': chrome.extension.getURL('practice.html')}, function(tab) {
			console.log('tab created with id: ' + tab.id);
			practice.openedTabsId.push(tab.id);
			//practice.sendSessionData();
		});
	
	},
	closeAll: function(){
		if (this.openedTabsId.length > 0){
			chrome.tabs.remove(this.openedTabsId, function(){
				console.log('Tabs to be removed: ' + practice.openedTabsId );
				practice.openedTabsId = [];	
			});
		}
	},
	sendSessionData: function(){

		
		//chrome.tabs.sendMessage(this.openedTabsId[0], {id: 'ping'});
		//chrome.tabs.sendMessage(this.openedTabsId[0], this.getSessionData());

		db.tx({name: 'get_n_where', colName: 'state', colVal: 'active', limit: '20'}, function(tx, rs){
			var nWords, nActiveRows;
			
			practice.sessionData = []; // clear the array
			nActiveRows = rs.rows.length;
			nWords = 20;
			
			for (var i = 0; i < nActiveRows; i++) {
				practice.sessionData.push( rs.rows.item(i)); 								// put new (state: active) element in the array
			}

			if (nActiveRows === nWords){	// TODO: substitute 20 with locally stored variable
				console.log(practice.sessionData);
				chrome.tabs.sendMessage(practice.openedTabsId[0], practice.sessionData);

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
					console.log(practice.sessionData);
					chrome.tabs.sendMessage(practice.openedTabsId[0], practice.sessionData);
				}); 
			}
		});
		
		
	}


}










//menu: function() {
	//console.log(localStorage['menu_id']);
	//chrome.contextMenus.remove(parseInt(localStorage['menu_id']));
	var id = chrome.contextMenus.create({
		title: 'New Word', 
		onclick: function(info, tab) {
			if (info.pageUrl.match(/https:\/\/chrome.google.com\/[extensions|webstore]/i))
				return alert('Lingvo Tutor can\'t add words from thos page.');
			chrome.tabs.create({url: chrome.extension.getURL('settings.html')});
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
*/

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

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
	console.log('opened');
	alert('opened');
});
















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
