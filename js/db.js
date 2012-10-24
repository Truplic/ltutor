var db = {
	open: function(){
		var database, tableName;
		database = openDatabase('lt_dbsdb', '', 'Database to store word, translation, description... values', 5 * 1024 * 1024);
		db.open = function() { return database; };
		tableName = ls.getSettings().activeTable;
		if (typeof tableName !== 'undefined' || tableName !== ""){
			db.tx({name: 'create_table', tableName: ls.getSettings().activeTable}, [])
		} else {
			console.log('You should start a procedure to add a table!');
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
						+	'created DATETIME DEFAULT CURRENT_TIMESTAMP,'
						+	'modified DATETIME DEFAULT CURRENT_TIMESTAMP);';
			row = [];
			console.log('created table: ' + r.tableName);
			break;
		case 'drop_table':
			query = 'DROP TABLE ' + r.tableName;
			row = [];
			
			break;

		// Drop current table

			/*if (SqlClient.db != null && SqlClient.currentTable && SqlClient.currentTable.name) {
				if (confirm("Delete Table \"" + SqlClient.currentTable.name + "\"?")) {
					$execute("DROP TABLE " + SqlClient.currentTable.name + ";", []);
				}
			}
		};*/
		case 'add_entry':
			var created = new Date();
			query = 'INSERT INTO '+  ls.getSettings().activeTable +' ('
						+	'word, translation, description, state, hits, tries, created, modified) '
						+	'VALUES (?,?,?,?,?,?,?,?)';
			row = [r.word, r.translation, r.description, 'waiting', '0', '0', created, created];
			
			break;

		case 'delete_entry':
			query = 'DELETE FROM '+  ls.getSettings().activeTable +' WHERE ID=? ';
			row = [r.id];

			break;
		case 'edit_entry':
			query = 'UPDATE '+  ls.getSettings().activeTable +' SET ' + r.editedColumn + '=?, modified=? WHERE id =?';
			row = [r.newValue, modified, r.id ];

			break;
		case 'repeat_entry':
			query = 'UPDATE '+  ls.getSettings().activeTable +' SET state=?, hits=?, tries=?, modified=? WHERE id =?';
			row = ["waiting", 0, 0, modified, r.id ];

			break;
		case 'validation_update':
			query = 'UPDATE '+  ls.getSettings().activeTable +' SET tries = tries + 1, hits = ?, state=?, modified=? WHERE id =?';
			row = [r.hits, r.state, modified, r.id ];

			break;
		/*case 'get_all_entries':

			query = 'SELECT * FROM lt_dbs ';
			row = [];
			
			break;*/
		case 'get_where':
			query = 'SELECT * FROM '+  ls.getSettings().activeTable +' WHERE '+ r.colName +' = "'+ r.colVal +'" ';
			row = [];
			
			break;
		case 'get_n_where':

			query = 'SELECT * FROM '+  ls.getSettings().activeTable +' WHERE '+ r.colName +' = "'+ r.colVal +'" LIMIT '+ r.limit +'';
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

var ls = {
	getSettings: function(){
		return ls.get('settings');
	},
	setSettings: function(key, value){
		var mySettings =  ls.get('settings');
		mySettings[key] = value;
		ls.set('settings', mySettings);

	},
	set: function(key, value){
		try {
		  window.localStorage.removeItem(key);
		  window.localStorage.setItem(key, JSON.stringify(value));
		}catch(e) {
		  console.log("Error inside setItem");
		  console.log(e);
		}
	},
	get: function(key) {
		var value;
		try {
		  value = window.localStorage.getItem(key);
		}catch(e) {
		  console.log("Error inside getItem() for key:" + key);
		  console.log(e);
		  value = "null";
		}
		return value && JSON.parse(value);
	}/*,

	clearStrg: function(){ 
		console.log('about to clear local storage');
		window.localStorage.clear();
		console.log('cleared');
	}*/
  
}