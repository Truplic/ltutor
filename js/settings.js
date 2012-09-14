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

$(function(){
	loadDbEntries();
	initListeners();

});




function initListeners(){
	"use strict"
	
	// add new word listener
	$('#addNewEntryBtn').click(function(evt){
		entry.name ='add_entry';
		entry.word = $('input#word').val();
		entry.translation = $('#translation').val();
		entry.description = $('#description').val();
		chrome.extension.getBackgroundPage().db.tx(entry, newEntryCallback);
	});
	
	$('#activateNotificationWindow').click(function(){
		chrome.extension.getBackgroundPage().practice.start();
	
	});
	// detect box editing; store edited entry {adding listeners for contenteditable & updating data on change]
	var before='';
	$('#dictTable').on('focus', 'div.editable', function(){
		before = $(this).text();
	}).on('blur', 'div.editable', function(){
		if (before !== $(this).text())
			$(this).trigger('change');
	}).on('change', 'div.editable', function(){
		var dbColumnName, rowId, boxId;
		dbColumnName = $(this).attr('lt_dbLinked');
		rowId =  $(this).closest('tr.table-row').attr('lt_dbLinked');
		boxId = $(this).attr('id');
		chrome.extension.getBackgroundPage().util.editDbRow(rowId, $(this).html(), dbColumnName, editEntryCallback(boxId));

		/*.db.tx({ // store edited row to db
				name: 'edit_entry', 
				editedColumn: myEditedColumn,  
				newValue: $(this).html(), 
				id: rowId
			}, editEntryCallback(boxId) );*/
	});
	
	// delete/cancel row button listener
	$('body').on('click', 'button.delete-row-btn', function(){
		var dbId = $(this).attr('lt_dbLinked');
		chrome.extension.getBackgroundPage().db.tx({name: 'delete_entry', id: dbId}, deleteEntryCallback(dbId));
		$('div.popover').hide();
	}).on('click', 'button.cancel-delete-row-btn', function(){
		$('div.popover').fadeOut();
	});
	
	
	// remove popovers when user click elsewhere
	$("body").click(function(){
	  $("div.popover").fadeOut();
	});
	
	
}
function newEntryCallback(){ 
	"use strict"
	// show message to the user
	$('#sucessAlert').fadeIn("slow").fadeOut('slow');
	
	// refresh the editDict table
	$('#dictTable').find('tbody').remove();		// remove the old rows from the dict table
	loadDbEntries(); 							// load new rows
}

function bindTableListeners(){
	"use strict"
	
	$('.delete-entry').popover({
		placement: 'top', 
		trigger: 'manual',
		html: 'true',
		content: function(){ 
			return '<div class="row-fluid">'
			+	  '<button type="button" class="delete-row-btn btn btn-primary btn-danger span6" lt_dblinked="'+$(this).closest('tr.table-row').attr('lt_dblinked')+'">Yes</button>'
			+	  '<button type="button" class="cancel-delete-row-btn btn span6">Cancel</button>'
			+	'</div>'},
		title: function(){ return 'Delete <strong>'+ $(this).closest('tr.table-row').find('.editable[lt_dblinked="word"]').text() +'</strong>?'}
	}).click(function(e){
		$('div.popover').fadeOut();
		$(this).popover('show');
		e.stopPropagation();
	});

}
function editEntryCallback(boxId){
	"use strict"
	// add class that indicates sucessfull edit
	$('#'+boxId).addClass('edit-sucess');
	setTimeout(function() { $('#'+boxId).removeClass('edit-sucess');},1000);
}

function loadDbEntries(){
	"use strict"
	chrome.extension.getBackgroundPage().db.tx({name: 'get_all_entries'}, loadDbEntriesCallback); // initial load of dictionary of entries
}
function loadDbEntriesCallback (tx, rs){
	"use strict"
	var rowOutput = '<tbody>';
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		rowOutput += renderRow(rs.rows.item(i));
	}
	$('#dictTable').append(rowOutput+'</tbody>');
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
	+			'<i href="#" class="delete-entry icon-trash" ></i>'
	+		'</td>'
	+'</tr>';
}

function deleteEntryCallback(entryId){
	"use strict"
	$('.table-row[lt_dbLinked='+entryId+']').fadeOut();
}
//<button type="button" class="btn btn-warning">Warning</button>