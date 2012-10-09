$(function(){
	initListeners();
	loadDbEntries();
});

var toLearnDT, learnedDT; 
function initListeners(){
	"use strict"
	///////////////////////////////////////
	// ADD NEW WORD BUTTON listener
	$('#addNewEntryBtn').click(function(evt){
		var word, translation, example;
		word = $(this).closest('div.add-word-form').find('#word');
		translation = $(this).closest('div.add-word-form').find('#translation');
		example =  $(this).closest('div.add-word-form').find('#description');
		
		if ((word.val().length !== 0) & (translation.val().length !== 0)){
			chrome.extension.getBackgroundPage().db.tx({	name: 'add_entry', 
															word: word.val(),
															translation: translation.val(),
															description: example.text()
														}, newEntryCallback);
		}else{
			clearNewWordWornings();
			if(word.val().length === 0){
				word.closest('div.control-group').addClass('warning');
				word.siblings('.help-inline').show();
			}
			if(translation.val().length === 0){
				translation.closest('div.control-group').addClass('warning');
				translation.siblings('.help-inline').show();
			}
			$(this).closest('div.add-word-form').find('.help-inline:visible:first').siblings('input, textarea').focus();
		}

	});
	$('#word').change(function(){
		var word = $(this).val();
		googleTranslate.translationRequest('en', 'hr', word, [], []);
	
	});
	// ADD NEW WORD KEYPRESS listener
	$('#word, #translation').keypress(function(){

		$(this).closest('.control-group').removeClass('warning');
		$(this).siblings('.help-inline').hide();
	})
	//-----------------------------------------
	
	
	///////////////////////////////////////
	// Detect DIV BOX EDITING; store edited entry {adding listeners for contenteditable & updating data on change]
	var before='';
	$('#toLearnTable').on('focus', 'div.editable', function(){
		before = $(this).text();
	}).on('blur', 'div.editable', function(){
		if (before !== $(this).text())
			$(this).trigger('change');
	}).on('change', 'div.editable', function(){
		var dbColumnName, rowId, boxId;
		dbColumnName = $(this).attr('lt_dbLinked');
		rowId =  $(this).closest('tr.table-row').attr('lt_dbLinked');
		boxId = $(this).attr('id');
		chrome.extension.getBackgroundPage().db.tx({ 	name: 'edit_entry', 
														editedColumn: dbColumnName,  
														newValue: $(this).html(), 
														id: rowId
													}, editEntryCallback(boxId) );
			
	}).on('click', 'button#delRowBtn', function(e){	// bind event listener for DELETE row tooltip
		$('div.popover').fadeOut().remove();
		$(this).popover({
			placement: 'top', 
			trigger: 'manual',
			html: 'true',
			content: function(){ 
				return '<div class="row-fluid">'
					+	  '<button type="button" class="delete-word-btn btn btn-primary btn-danger span6" lt_dblinked="'+$(this).closest('tr.table-row').attr('lt_dblinked')+'">Yes</button>'
					+	  '<button type="button" class="cancel-popup-btn btn span6">Cancel</button>'
					+	'</div>'},
			title: function(){ return 'Delete word <strong>'+ $(this).closest('tr.table-row').find('div.editable[lt_dblinked="word"]').text() +'</strong>?'}
		})
		$(this).popover('show');
		e.stopPropagation();
	}).on('click', 'button#archiveRowBtn', function(e){	// bind event listener for ARCHIVE row tooltip
		$('div.popover').fadeOut().remove();
		$(this).popover({
			placement: 'top', 
			trigger: 'manual',
			html: 'true',
			content: function(){ 
				return '<div class="row-fluid">'
					+	  '<button type="button" class="archive-word-btn btn btn-primary btn-warning span6" lt_dblinked="'+$(this).closest('tr.table-row').attr('lt_dblinked')+'">Yes</button>'
					+	  '<button type="button" class="cancel-popup-btn btn span6">Cancel</button>'
					+	'</div>'},
			title: function(){ return 'Move to <em>Learned word</em> <strong>'+ $(this).closest('tr.table-row').find('div.editable[lt_dblinked="word"]').text() +'</strong>?'}
		})
		$(this).popover('show');
		e.stopPropagation();
	});
	//-----------------------------------------
	
	///////////////////////////////////////
	// REPEAT WORD button listener
	$('#learnedTable').on('click', 'button#repeatBtn', function(e){	// bind event listener for repeat word tooltip
		$('div.popover').fadeOut().remove();
		$(this).popover({
			placement: 'top', 
			trigger: 'manual',
			html: 'true',
			content: function(){ 
				return '<div class="row-fluid">'
					+	  '<button type="button" class="repeat-word-btn btn btn-primary btn-warning span6" lt_dblinked="'+$(this).closest('tr.table-row').attr('lt_dblinked')+'">Yes</button>'
					+	  '<button type="button" class="cancel-popup-btn btn span6">Cancel</button>'
					+	'</div>'},
			title: function(){ return 'Learn again word <strong>'+ $(this).closest('tr.table-row').find('div[lt_dblinked="word"]').text() +'</strong>?'}
		})
		$(this).popover('show');
		e.stopPropagation();
	});
	//-----------------------------------------
	
	///////////////////////////////////////
	// Delete/Repeat/Archive/Cancel POPUP button listener
	$('body').on('click', 'div.popover', function(e){  // prevent bubbling when user clicks on popup
		e.stopPropagation();
	}).on('click', 'button.delete-word-btn', function(){
		var rowId = $(this).attr('lt_dbLinked');  // Id from the button in the popup
		chrome.extension.getBackgroundPage().db.tx({name: 'delete_entry', id: rowId}, removeFromDataTable(rowId, toLearnDT));
		
		$(this).closest('div.popover').remove();
	}).on('click', 'button.archive-word-btn', function(){  // Repeat Word button listener
		//var dbId = $(this).attr('lt_dbLinked');
		var dbColumnName, rowId;
		dbColumnName = 'state';
		rowId = $(this).attr('lt_dbLinked');  // Id from the button in the popup
		
		chrome.extension.getBackgroundPage().db.tx({ 	name: 'edit_entry', 
														editedColumn: dbColumnName,  
														newValue: 'learned', 
														id: rowId
													}, removeFromDataTable(rowId, toLearnDT) );
		// show the entry in the learned table
		chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'id', colVal: rowId}, loadLearnedDbEntriesCallback);	
		$(this).closest('div.popover').remove();
	}).on('click', 'button.repeat-word-btn', function(){  // Repeat Word button listener
		//var dbId = $(this).attr('lt_dbLinked');
		var rowId;
		rowId = $(this).attr('lt_dbLinked');  // Id from the button in the popup
		
		chrome.extension.getBackgroundPage().db.tx({ 	name: 'repeat_entry', 
														id: rowId
													}, removeFromDataTable(rowId, learnedDT) );
		// show the entry in the toLearn table
		chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'id', colVal: rowId}, loadToLearnDbEntriesCallback);	
		$(this).closest('div.popover').remove();
	}).on('click', 'button.cancel-popup-btn', function(e){
		$(this).closest('div.popover').fadeOut();
	});

	///////////////////////////////////////
	// Remove popovers when user click elsewhere
	$(document).click(function(){
	  $('div.popover').remove();
	});
	//-----------------------------------------
	
	
	///////////////////////////////////////
	// Initialize DATA TABLES
	toLearnDT = $('#toLearnTable').dataTable( {
		"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
		"sPaginationType": "bootstrap",
		"iDisplayLength": 50,
		"oLanguage": {
			"sLengthMenu": "_MENU_ words per page"
		},
		"bAutoWidth": false,
		"aoColumnDefs": [
		  { 'bSortable': false, 'aTargets': [ 4] } // make it not sortable
		]
	} );
	
	learnedDT = $('#learnedTable').dataTable( {
		"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
		"sPaginationType": "bootstrap",
		"iDisplayLength": 50,
		"oLanguage": {
			"sLengthMenu": "_MENU_ words per page"
		},
		"bAutoWidth": false,
		"aoColumnDefs": [
		  { 'bSortable': false, 'aTargets': [ 3 ] } // make it not sortable
		]
	} );
	//-----------------------------------------
	
	///////////////////////////////////////
	// Initialize SETTINGS TAB
	$('#'+chrome.extension.getBackgroundPage().settings.get('learningMode')).button('toggle');
	$('#sessionFreq').val(chrome.extension.getBackgroundPage().settings.get('sessionFreq'));
	$('#learnedTreshold').val(chrome.extension.getBackgroundPage().settings.get('learnedTreshold'));
	$('#wordsPerSession').val(chrome.extension.getBackgroundPage().settings.get('wordsPerSession'));

	
	$('button.learningMode').click(function(){	// Learning mode button listener
		console.log($(this).attr('id')+' changed');
		//$(this).addClass('btn-primary').siblings('.learningMode').removeClass('btn-primary');
		chrome.extension.getBackgroundPage().settings.set('learningMode', $(this).attr('id'));
	});
	
	$('#sessionFreq, #learnedTreshold, #wordsPerSession').change(function(){
		console.log($(this).attr('id')+' changed');
		chrome.extension.getBackgroundPage().settings.set($(this).attr('id'), $(this).val());
	});
	

	
	//-----------------------------------------
}

function newEntryCallback(tx, rs){ 
	"use strict"
	// BLINK confirmation message to the user
	clearNewWordWornings();
	$('div.add-word-form').find('textarea, input, .editable').val('').text('');				// reset values
	//$('#sucessAlert').fadeIn("slow").fadeOut('slow');
	chrome.extension.getBackgroundPage().db.tx({name: 'get_n_where', colName: 'id', colVal: rs.insertId, limit: '1'}, loadToLearnDbEntriesCallback); // load entered value to data table
	$('#word').focus();
}
function clearNewWordWornings(){
	$('div.add-word-form').find('.warning').removeClass('warning');  	// remove all warning coloring
	$('div.add-word-form').find('.help-inline').hide();					// hide all warning helpers
}
function editEntryCallback(boxId){
	"use strict"
	var cell, aPos;
	cell = $('#' + boxId);
	
	// display sucess label
	cell.addClass('edit-sucess');
	setTimeout(function() { $('#' + boxId).removeClass('edit-sucess');}, 1000);
	
	// Update the DataTable
	aPos = toLearnDT.fnGetPosition( cell.closest('td')[0] );
	toLearnDT.fnUpdate(  cell.closest('td').html(), aPos[0], aPos[1] );
}

function loadDbEntries(){
	"use strict"
	// chrome.extension.getBackgroundPage().db.tx({name: 'get_all_entries'}, loadToLearnDbEntriesCallback); // initial load of dictionary of entries
	chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'state', colVal: 'active'}, loadToLearnDbEntriesCallback);	
	chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'state', colVal: 'waiting'}, loadToLearnDbEntriesCallback);
	chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'state', colVal: 'learned'}, loadLearnedDbEntriesCallback);
}

function loadToLearnDbEntriesCallback (tx, rs) {
	"use strict"
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		renderToLearnRow(rs.rows.item(i));
	}
}

function loadLearnedDbEntriesCallback (tx, rs) {
	"use strict"
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		renderLearnedRow(rs.rows.item(i));
	}
}

function renderToLearnRow(row) {
	"use strict"
	var hits, cRowElement, a, hideAttr;
	

	//progressbarColor = (hits >= 100) ? 'progress-success': 'progress-info progress-striped active';
	if (row.state === "active"){
		hideAttr = '';
		hits = parseFloat(row.hits) / parseFloat(chrome.extension.getBackgroundPage().settings.get('learnedTreshold')) * 100; 
	}else{
		hideAttr = 'hidden';
		hits = -1;
	}

	// Add row to datatable
    a = toLearnDT.fnAddData( [
        '<div id="word'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="word" >'+row.word+'</div>',
        '<div id="translation_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="translation">'+row.translation+'</div>',
        '<div id="description_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="description">'+row.description+'</div>',
		'<div class="hidden">'+ hits +'</div>' // added to enable column sorting
	+	'<div class="progress progress-success progress-striped active" '+ hideAttr +'>'
	+	  '<div class="bar" style="width:'+hits+'%;"></div>'
	+	'</div>',
		'<button id="archiveRowBtn" type="button" class="btn"><i href="#" class="icon-ok" ></i></button>'
	+	'<button id="delRowBtn" type="button" class="btn"><i href="#" class="icon-trash" ></i></button>'] ); 
	
	// Add attributes to the added row 
	cRowElement = toLearnDT.fnSettings().aoData[ a ].nTr;
	$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
}

function renderLearnedRow(row) {
	"use strict"
	var  cRowElement;
	
	// Add row to datatable
    var a = learnedDT.fnAddData( [
        '<div id="word'+ row.id +'" class="" lt_dbLinked="word" >'+row.word+'</div>',
        '<div id="translation_'+ row.id +'" class="" lt_dbLinked="translation">'+row.translation+'</div>',
        '<div id="description_'+ row.id +'" class="" lt_dbLinked="description">'+row.description+'</div>',
		'<button id="repeatBtn" type="button" class="btn"><i href="#" class="icon-repeat" ></i></button>'] ); 
	
	// Add attributes to the added row 
	cRowElement = learnedDT.fnSettings().aoData[ a ].nTr;
	$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
}

function removeFromDataTable(entryId, table){
	"use strict"
	var rowPos = table.fnGetPosition( $('tr.table-row[lt_dbLinked='+entryId+']')[0] );
	if(rowPos!==null){
	  table.fnDeleteRow(rowPos);  // delete row
    }
}


var googleTranslate = {
	translationRequest: function(langFrom, langTo, text, onLoadFn, onErrorFn) {
		var url = this.getGoogleUrl("api", langFrom, langTo, text);
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
			// JSON.parse does not evaluate the attacker's scripts.
			if(xhr.responseText.length){
				var resp = JSON.parse(xhr.responseText);
				console.log(resp);
				
				if(typeof resp.sentences !== 'undefined'){	// Translation handling
					var gTranslation_array = new Array();
					$.each(resp.sentences, function(index, value){  
						gTranslation_array[index] = value.trans;
					});
					console.log('translation is ' + gTranslation_array);
					$('#translation').val(gTranslation_array.join(","));
				}
				
				if(typeof resp.dict !== 'undefined'){		// Example handling
					var gDescription_array = new Array();
					$.each(resp.dict, function(index, value){  
						console.log( value.pos);
						$.each(value.entry, function(index, value){  
							console.log( value.word + ': '+ value.reverse_translation.join(", "));
						});
					});
					//console.log('description is ' + gDescription_array);
					//$('#description').val(gTranslation_array.join(", "));
				}
			}
		  }
		}
		xhr.send();
		
		
	
	},
	getGoogleUrl: function(urlType, langFrom, langTo, text) {
		var formattedUrl='';
		formattedUrl = 'http://translate.google.com/translate_a/t?client=gtranslate&sl=' + langFrom + '&tl=' + langTo + '&text=' + encodeURIComponent(text);
		return formattedUrl;
	}

}