var addWord = {



}

var entry = {
	id: '',
	name:'',
	word: '',
	translation: '',
	description: '',
	state: ''
}
//console.log(chrome.extension.getBackgroundPage());
$(function(){
	initListeners();
	loadMyEntries();
});




function initListeners(){
	"use strict"
	// add new word listener
	$('#addNewEntryBtn').click(function(evt){
		console.log('clicked');
		entry.name ='add_entry';
		entry.word = $('input#word').val();
		entry.translation = $('#translation').val();
		entry.description = $('#description').val();
		chrome.extension.getBackgroundPage().db.tx(entry, newEntryCallback);
	});
}
function newEntryCallback(){ 
	"use strict"
	// show message to the user
	$('#sucessAlert').fadeIn("slow").fadeOut('slow');
	
	// refresh the editDict table
	$('#editDictBody').find('table').remove();	// remove the old table
	loadMyEntries(); 							// load new table
}

function bindTableListeners(){
	"use strict"
	
	// remove entry (row)
	$('.delete-entry').click(function(){
		var entryId = $(this).closest('tr.table-row').attr('lt_dbLinked');
		chrome.extension.getBackgroundPage().db.tx({name: 'delete_entry', id: entryId}, deleteEntryCallback(entryId));
		//$(this).closest('tr').remove();
	});	
	
	// edit table entry {adding listeners for contenteditable & updating data on change]
	var before='';
	$('div.editable')
		.focus(function(){
			before = $(this).text();
		}).blur(function(){
			if (before !== $(this).text()){
				$(this).trigger('change');
			}
		}).change(function(){
			var myEditedColumn, rowId, boxId;
			myEditedColumn = $(this).attr('lt_dbLinked');
			rowId =  $(this).closest('tr.table-row').attr('lt_dbLinked');
			boxId = $(this).attr('id');
			
			// store edited row to db
			chrome.extension.getBackgroundPage().db.tx({
					name: 'edit_entry', 
					editedColumn: myEditedColumn,  
					newValue: $(this).text(), 
					id: rowId
				}, editEntryCallback(boxId) );
		});
}
function editEntryCallback(boxId){
	"use strict"
	// add class that indicates sucessfull edit
	$('#'+boxId).addClass('edit-sucess');
	setTimeout(function() { $('#'+boxId).removeClass('edit-sucess');},1000);
}

function loadMyEntries(){
	"use strict"
	chrome.extension.getBackgroundPage().db.tx({name: 'get_all_entries'}, loadMyEntriesCallback); // initial load of dictionary of entries
}
function loadMyEntriesCallback (tx, rs){
	"use strict"
	var rowOutput = '<table class="table table-hover">'
					+'<thead>'
					+	'<tr>'
					+		'<th>%</th>'
					+		'<th>Word</th>'
					+		'<th>Translation</th>'
					+		'<th>Description</th>'
					+		'<th>Delete</th>'
					+   '</tr>'
					+'</thead><tbody>';
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		rowOutput += renderRow(rs.rows.item(i));
	}
	$('#editDictBody').append(rowOutput+'</tbody></table>');
	bindTableListeners();	// new content is added which requires new listeners
}
function renderRow(row) {
	"use strict"
	var hits, progressbarColor;
	hits = parseFloat(row.hits) / 20 * 100; // TODO: substitute 20 with stored settings value
	progressbarColor = (hits === 100) ? 'progress-success': 'progress-info progress-striped active';
	
	return '<tr class="table-row" lt_dbLinked="'+row.id+'">'
	+		'<td style="width:150px; vertical-align:middle;">'
	+			'<div class="progress '+ progressbarColor +'" style="margin-bottom: 0px;"">'
	+			  '<div class="bar" style="width:'+hits+'%;"></div>'
	+			'</div>'
	+		'</td>'
	+		'<td><div id="word'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="word" ><em>'+row.word+'</em></div></td>'
	+		'<td><div id="translation_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="translation">'+row.translation+'</div></td>'
	+		'<td><div id="description_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="description">'+row.description+'</div></td>'
	+		'<td style="vertical-align:middle;">'
	+			'<i class="delete-entry icon-trash"></i>'
	+		'</td>'
	+'</tr>';
}

function deleteEntryCallback(entryId){
	"use strict"
	//console.log('deleted row has ID'+ $('.table-row[lt_dbLinked='+entryId+']'));
	$('.table-row[lt_dbLinked='+entryId+']').remove();
}