
$(function(){
	initListeners();
	loadDbEntries();
});

var dictDT; 
function initListeners(){
	"use strict"
	
	// Add new word listener
	$('#addNewEntryBtn').click(function(evt){
		chrome.extension.getBackgroundPage().db.tx({	
			name: 'add_entry', 
			word: $('input#word').val(), 
			translation: $('#translation').val(),  
			description: $('#description').val() }, newEntryCallback);
	});
	
	/*$('#activateNotificationWindow').click(function(){
		chrome.extension.getBackgroundPage().practice.start();
	});*/
	
	// Detect box editing; store edited entry {adding listeners for contenteditable & updating data on change]
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
			
	}).on('click', '.delete-entry', function(e){	// bind event listener for delete tooltip
		$('div.popover').fadeOut().remove();
		$(this).popover({
			placement: 'top', 
			trigger: 'manual',
			html: 'true',
			content: function(){ 
				return '<div class="row-fluid">'
					+	  '<button type="button" class="delete-row-btn btn btn-primary btn-danger span6" lt_dblinked="'+$(this).closest('tr.table-row').attr('lt_dblinked')+'">Yes</button>'
					+	  '<button type="button" class="cancel-delete-row-btn btn span6">Cancel</button>'
					+	'</div>'},
			title: function(){ return 'Delete <strong>'+ $(this).closest('tr.table-row').find('.editable[lt_dblinked="word"]').text() +'</strong>?'}
		})
		$(this).popover('show');
		e.stopPropagation();
	});
	
	// Delete/cancel row button listener
	$('body').on('click', 'button.delete-row-btn', function(){
		var dbId = $(this).attr('lt_dbLinked');
		chrome.extension.getBackgroundPage().db.tx({name: 'delete_entry', id: dbId}, deleteEntryCallback(dbId));
		$('div.popover').remove();
	}).on('click', 'button.cancel-delete-row-btn', function(e){
		$('div.popover').fadeOut();
		e.preventPropagation();
	});
	
	// Remove popovers when user click elsewhere
	$("body").click(function(){
	  $("div.popover").remove();
	});
	
	// Initialize DATA TABLE
	dictDT = $('#dictTable').dataTable( {
		"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
		"sPaginationType": "bootstrap",
		"iDisplayLength": 50,
		"oLanguage": {
			"sLengthMenu": "_MENU_ records per page"
		},
		"bAutoWidth": false,
		"aoColumnDefs": [
		  { 'bSortable': false, 'aTargets': [ 0, 4 ] } // make it not sortable
		]
	} );
}

function newEntryCallback(tx, rs){ 
	"use strict"
	// BLINK confirmation message to the user
	$('#sucessAlert').fadeIn("slow").fadeOut('slow');
	chrome.extension.getBackgroundPage().db.tx({name: 'get_n_where', colName: 'id', colVal: rs.insertId, limit: '1'}, loadDbEntriesCallback); // load entered value to data table
}

function editEntryCallback(boxId){
	"use strict"
	var cell, aPos;
	cell = $('#' + boxId);
	
	// display sucess label
	cell.addClass('edit-sucess');
	setTimeout(function() { $('#' + boxId).removeClass('edit-sucess');}, 1000);
	
	// Update the DataTable
	aPos = dictDT.fnGetPosition( cell.closest('td')[0] );
	dictDT.fnUpdate(  cell.closest('td').html(), aPos[0], aPos[1] );
}

function loadDbEntries(){
	"use strict"
	chrome.extension.getBackgroundPage().db.tx({name: 'get_all_entries'}, loadDbEntriesCallback); // initial load of dictionary of entries
}

function loadDbEntriesCallback (tx, rs){
	"use strict"
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		renderRow(rs.rows.item(i));
	}
}

function renderRow(row) {
	"use strict"
	var hits, progressbarColor, cRowElement;
	hits = parseFloat(row.hits) / 20 * 100; // TODO: substitute 20 with stored settings value
	progressbarColor = (hits === 100) ? 'progress-success': 'progress-info progress-striped active';
	
	// Add row to datatable
    var a = dictDT.fnAddData( [
		'<div class="progress '+ progressbarColor +'" ">'
	+	  '<div class="bar" style="width:'+hits+'%;"></div>'
	+	'</div>',
        '<div id="word'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="word" >'+row.word+'</div>',
        '<div id="translation_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="translation">'+row.translation+'</div>',
        '<div id="description_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="description">'+row.description+'</div>',
		'<i href="#" class="delete-entry icon-trash" ></i>'] );
	
	// Add attributes to the added row 
	cRowElement = dictDT.fnSettings().aoData[ a ].nTr;
	$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
}

function deleteEntryCallback(entryId){
	"use strict"
	var rowPos = dictDT.fnGetPosition( $('tr.table-row[lt_dbLinked='+entryId+']')[0] );
	if(rowPos!==null){
	  dictDT.fnDeleteRow(rowPos);//delete row
    }
}