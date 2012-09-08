var db = {
	open: function(){
		var database = openDatabase('lt_dictdb', '', 'Database to store word, translation, description... values', 5 * 1024 * 1024);
		db.open = function() { return database; };
		db.tx({name: 'create_table'}, [])
		return database;
	},

	tx: function(r, callback){
		var query, row;
		
		switch (r.name){
		case 'create_table':
			query = 'CREATE TABLE IF NOT EXISTS lt_dict (' 
						+	'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,' 
						+	'word TEXT NOT NULL,'
						+	'translation TEXT NOT NULL,'
						+ 	'description TEXT,'
						+	'state TEXT,'
						+	'hits INTEGER NOT NULL,'
						+	'nOfTries INTEGER NOT NULL,'
						+	'created DATETIME DEFAULT CURRENT_TIMESTAMP,'
						+	'modified DATETIME DEFAULT CURRENT_TIMESTAMP);';
			row = [];
			
			break;
			
		case 'add_entry':
			var created = new Date();
			query = 'INSERT INTO lt_dict ('
						+	'word, translation, description, state, hits, nOfTries, created, modified) '
						+	'VALUES (?,?,?,?,?,?,?,?)';
						
			row = [r.word, r.translation, r.description, 'waiting', '0', '0', created, created];
			
			break;

		case 'delete_entry':

			query = 'DELETE FROM lt_dict WHERE ID=? ';
			row = [r.id];

			break;
		case 'edit_entry':

			query = 'UPDATE lt_dict SET ' + r.editedColumn + '=? WHERE id =?';
			row = [r.newValue, r.id ];

			break;
		case 'get_all_entries':

			query = 'SELECT * FROM lt_dict ';
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
