var db = {
	open: function(){
		var database, currTableName;
		database = openDatabase('lt_db', '', 'Database to store word, translation, description... values', 5 * 1024 * 1024);
		db.open = function() { return database; };
		currTableName = ls.get('activeTable').name;
		if (typeof currTableName !== 'undefined' && currTableName !== "" && currTableName !== null){
			console.log('[Info] About to create/open the table ' + currTableName);
			db.tx({name: 'create_table', tableName: currTableName}, []);
		} else {
			console.log('[Warning] No table found! You should start a procedure to add a new table!');
		}
		return database;
	},

	tx: function(r, callback){
		var query, row, modified;
		modified = new Date();
		
		switch (r.name){
		case 'get_all_tables':
			query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"; //'SELECT * from sqlite_master WHERE type = "table"'; //'SELECT * from sys.tables'; //'SELECT * FROM lt_dbsdb.sqlite_master WHERE type="table"';
			
			break;
		case 'create_table':
			var tableName = r.tableName;
			query = 'CREATE TABLE IF NOT EXISTS '+ r.tableName +' (' 
						+	'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,' 
						+	'word TEXT NOT NULL,'
						+	'translation TEXT NOT NULL,'
						+ 	'description TEXT,'
						+	'state TEXT,'
						+	'hits UNSIGNED INTEGER NOT NULL,'
						+	'tries UNSIGNED INTEGER NOT NULL,'
						+	'trend TEXT,'
						+	'created DATETIME DEFAULT CURRENT_TIMESTAMP,'
						+	'modified DATETIME DEFAULT CURRENT_TIMESTAMP);';
			row = [];
			break;
		case 'drop_table':
			query = 'DROP TABLE ' + r.tableName;
			row = [];
			
			break;
		case 'add_entry':
			var created = new Date();
			query = 'INSERT INTO '+  ls.get('activeTable').name +' ('
						+	'word, translation, description, state, hits, tries, trend, created, modified) '
						+	'VALUES (?,?,?,?,?,?,?,?,?)';
			row = [r.word, r.translation, r.description, 'waiting', '0', '0', '', created, created];
			
			break;

		case 'delete_entry':
			query = 'DELETE FROM '+  ls.get('activeTable').name +' WHERE ID=? ';
			row = [r.id];

			break;
		case 'edit_entry':
			query = 'UPDATE '+  ls.get('activeTable').name +' SET ' + r.editedColumn + '=?, modified=? WHERE id =?';
			row = [r.newValue, modified, r.id ];

			break;
		case 'repeat_entry':
			query = 'UPDATE '+  ls.get('activeTable').name +' SET state=?, hits=?, tries=?, modified=? WHERE id =?';
			row = ["waiting", 0, 0, modified, r.id ];

			break;
		case 'validation_update':
			//var myTrend = r.hits + ';';
			query = 'UPDATE '+  ls.get('activeTable').name +' SET tries = tries + 1, hits = ?, state=?, trend=?, modified=? WHERE id =?';
			row = [r.hits, r.state, r.trend, modified, r.id ];

			break;
		case 'get_all_entries':

			query = 'SELECT * FROM '+r.tableName;
			row = [];
			
			break;
		case 'get_where':
			query = 'SELECT * FROM '+  ls.get('activeTable').name +' WHERE '+ r.colName +' = "'+ r.colVal +'" ';
			row = [];
			
			break;
		case 'get_n_where':

			query = 'SELECT * FROM '+  ls.get('activeTable').name +' WHERE '+ r.colName +' = "'+ r.colVal +'" LIMIT '+ r.limit +'';
			row = [];
			
			break;

		default:
			console.log('default in tx');
		}
	
		db.open().transaction(
			function(tx) {
				tx.executeSql(query, row,
							callback,
							db.onError );
			} 
		);
	},
	
	onError: function(tx, e) {
		alert("There has been a database error: " + e.message);
	}
}
// var storage = chrome.storage.local;

var ls = {
	defaultSettings: {sessionFreq: 120, learnedTreshold: 5, wordsPerSession: 3, learningMode: 'tutorMode', autoPlay: "true", activeTable: {name: null, iSpeak: null, iLearn: null, hasAudio: null}},
	/*getSettings: function(){
		return ls.get('settings');
	},
	setSettings: function(key, value){
		var mySettings =  ls.get('settings');
		mySettings[key] = value;
		ls.set('settings', mySettings);

	},*/
	set: function(key, value){
		try {
		  localStorage.removeItem(key);
		  localStorage[key] = JSON.stringify(value);
		  console.log('[Info] Saved pair ['+ key +', ' + value +'].');
		}catch(e) {
		  console.log("Error inside setItem");
		  console.log(e);
		}
	},

	get: function(key) {
		var value;
		if (key in localStorage) {
			value = localStorage[key] && JSON.parse(localStorage[key]);
			console.log('[Info] Loaded ls data pair ['+ key +', ' + value +'].');
		} else if (key in  ls.defaultSettings){
			value = ls.defaultSettings[key];
			console.log('[Info] Loaded default data pair ['+ key +', ' + value +'].');
		} else{
			console.log('[Error] No local data found for key: "'+key+'"');
			value = null;
		}
		return value;
	}
	
/*
	clearStrg: function(){ 
		console.log('about to clear local storage');
		window.localStorage.clear();
		console.log('cleared');
	}*/
  
}