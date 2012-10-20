$(function(){
	loadDbEntries();
	initListeners();
});


function initListeners(){
	"use strict"
	///////////////////////////////////////
	// ADD NEW WORD BUTTON listener
	$('.add-word-form').on('click', '#addNewEntryBtn', function(evt){
		var word, translation, example;
		word = $(this).closest('div.add-word-form').find('#word');
		translation = $(this).closest('div.add-word-form').find('#translation');
		example =  $(this).closest('div.add-word-form').find('#description');
		
		if ((word.val().length !== 0) & (translation.val().length !== 0)){
			chrome.extension.getBackgroundPage().db.tx({	name: 'add_entry', 
															word: word.val(),
															translation: translation.val(),
															description: example.html()
														}, newWordForm.add_cb);
		}else{
			newWordForm.clearWornings();
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

	}).on('change', '#word', function(){
		var word;
		word = $(this).val();
		if (isOnline() && word.length){
			$('button#playWordBtn').removeClass('hidden');
			googleTranslate.translationRequest('en', 'hr', word, newWordForm.handleTranslation, []);
		}
	
	}).on('click', '#playWordBtn', function(){
		playWord($('#word').val());
	
	}).on('click', '.addword-dropdown', function(e){
		var wordToAdd, translationField, translationContent_array, caretStart, caretEnd;
		wordToAdd = $(this).text().trim().toLowerCase();
		translationField = $('#translation');
		translationContent_array = translationField.val().replace(/\s+/g, '').toLowerCase().split(/[;,.]+/);

		if ($.inArray(wordToAdd.replace(/\s+/g, ''), translationContent_array) === -1) {  // add word if not present 
			if(translationField.val() !== ""){
				translationField.val(translationField.val() + ', ' + wordToAdd); // Merge with other content
			} else {
				translationField.val(wordToAdd);
			}
		}
		
		translationField.focus();
		// set caret
		caretStart = translationField.val().indexOf(wordToAdd);  // TODO: domacinstvo & dom -> wrong selection
		caretEnd = caretStart + wordToAdd.length;
		translationField.selectRange(caretStart,caretEnd);

	}).on('click', '#translation', function(e){
		e.stopPropagation();
	}).on('focus', '#translation', function(){
		//console.log('tr clicked');
		$(this).closest('div.dropdown').addClass('open');
	}).on('keypress', '#word, #translation', function(){
		$(this).closest('.control-group').removeClass('warning');
		$(this).siblings('.help-inline').hide();
	});
	
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
													}, dTable.editCell_cb(boxId) );
			
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
		chrome.extension.getBackgroundPage().db.tx({name: 'delete_entry', id: rowId}, dTable.remove(rowId, toLearnDT));
		
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
													}, dTable.remove(rowId, toLearnDT) );
		// show the entry in the learned table
		chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'id', colVal: rowId}, dTable.learned.load);	
		$(this).closest('div.popover').remove();
	}).on('click', 'button.repeat-word-btn', function(){  // Repeat Word button listener
		//var dbId = $(this).attr('lt_dbLinked');
		var rowId;
		rowId = $(this).attr('lt_dbLinked');  // Id from the button in the popup
		
		chrome.extension.getBackgroundPage().db.tx({ 	name: 'repeat_entry', 
														id: rowId
													}, dTable.remove(rowId, learnedDT) );
		// show the entry in the toLearn table
		chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'id', colVal: rowId}, dTable.toLearn.load);	
		$(this).closest('div.popover').remove();
	}).on('click', 'button.cancel-popup-btn', function(){
		$(this).closest('div.popover').fadeOut();
	}).on('click', 'button.play-btn', function(){
		var txt = $(this).closest('tr.table-row').find('div.[lt_dblinked="word"]').text();
		// console.log('play '+ txt);
		playWord(txt);
	});

	///////////////////////////////////////
	// Remove popovers when user click elsewhere
	$(document).click(function(){
	  $('div.popover').remove();
	  $('div.dropdown').removeClass('open');
	});
	//-----------------------------------------
	
	///////////////////////////////////////
	// Initialize DATA TABLES
	dTable.init();
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

// check if we are online
function isOnline(){
	return navigator.onLine;
}

var newWordForm = {
	add_cb: function(tx, rs){ 
		"use strict"
		// BLINK confirmation message to the user
		newWordForm.clearWornings();
		newWordForm.resetFields();
		newWordForm.indicateSucess();
		chrome.extension.getBackgroundPage().db.tx({name: 'get_n_where', colName: 'id', colVal: rs.insertId, limit: '1'}, dTable.toLearn.load); // load entered value to data table
		$('#word').focus();
	},
	clearWornings: function(){
		$('div.add-word-form').find('.warning').removeClass('warning');  	// remove all warning coloring
		$('div.add-word-form').find('.help-inline').hide();					// hide all warning helpers
	},
	resetFields: function(){
		$('div.add-word-form').find('textarea, input, .editable').val('').text('');				// reset values
	},
	indicateSucess: function(){
		//$('#sucessAlert').fadeIn("slow").fadeOut('slow');
		console.log('word added to db');
	
	},
	handleTranslation: function(resp){
		var gTranslation, gDescription_array, dropdownMenuStream;
		console.log(resp);
		$('#translation').closest('div.dropdown').find('ul.dropdown-menu').remove();  // first remove the existing dropdown translations
		if (typeof resp.sentences !== 'undefined'){	// Translation handling
			gTranslation = resp.sentences[0].trans;
			$('#translation').val(gTranslation);
		}
		
		if (typeof resp.dict !== 'undefined'){		// word alternative translations handling
			dropdownMenuStream = '<ul class="dropdown-menu" role="menu" aria-labelledby="translation">';
			gDescription_array = new Array();
			$.each(resp.dict, function(index, value){  
				dropdownMenuStream += '<li><div class="category"><strong>' + value.pos + '</strong></div></li>';
				$.each(value.entry, function(index, value){
					if (gTranslation !== value.word )
						dropdownMenuStream +='<li><a class="addword-dropdown" tabindex="-1" class="category">' +value.word + '</a></li>';
				});
			});
			dropdownMenuStream += '</ul>'
			console.log(dropdownMenuStream);
			$('#translation').closest('div.dropdown').append(dropdownMenuStream);
		}
	}

}

function playWord(word){
	$('#ltPlayer').children().remove();
	$('#ltPlayer').append(
		'<audio controls="controls">'
		+	'<source src='+ googleTranslate.getGoogleUrl("audio", 'en', [], word ) +' type="audio/mpeg">'
		+	'Your browser does not support the audio element.'
		+'</audio>'	);
	$('audio').trigger('play');
}


function loadDbEntries(){
	"use strict"
	// chrome.extension.getBackgroundPage().db.tx({name: 'get_all_entries'}, loadToLearnDbEntriesCallback); // initial load of dictionary of entries
	chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'state', colVal: 'active'}, dTable.toLearn.load);
	chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'state', colVal: 'waiting'}, dTable.toLearn.load);
	chrome.extension.getBackgroundPage().db.tx({name: 'get_where', colName: 'state', colVal: 'learned'}, dTable.learned.load);
}

var toLearnDT, learnedDT; 
var dTable = {
	init: function(){ // Initialize DATA TABLES
		toLearnDT = $('table#toLearnTable').dataTable( {
			"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
			"sPaginationType": "bootstrap",
			"iDisplayLength": 50,
			"oLanguage": {
				"sLengthMenu": "_MENU_ words per page"
			},
			"bAutoWidth": false,
			"aaSorting": [[ 3, "desc" ]],  // default sorting column
			"aoColumnDefs": [
			  { 'bSortable': false, 'aTargets': [ 4 ] } // make it not sortable
			]
		} );
		
		learnedDT = $('table#learnedTable').dataTable( {
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

	},
	editCell_cb: function(boxId){  // TODO: separate this to update & display label
		"use strict"
		var cell, aPos;
		cell = $('#' + boxId);
		
		// display sucess label
		cell.addClass('edit-sucess');
		setTimeout(function() { $('#' + boxId).removeClass('edit-sucess');}, 1000);
	
		// Update the DataTable
		aPos = toLearnDT.fnGetPosition( cell.closest('td')[0] );
		toLearnDT.fnUpdate(  cell.closest('td').html(), aPos[0], aPos[1] );
	},
	remove: function(entryId, table){
		"use strict"
		var rowPos = table.fnGetPosition( $('tr.table-row[lt_dbLinked='+entryId+']')[0] );
		if(rowPos!==null){
		  table.fnDeleteRow(rowPos);  // delete row
		}
	},
	toLearn: {
		load: function(tx, rs) {
			"use strict"
			for (var i=rs.rows.length-1; i >= 0 ; i--) {
				dTable.toLearn.renderRow(rs.rows.item(i));
			}
		},
		renderRow: function(row) {
			"use strict"
			var hits, cRowElement, a, hideAttr;
			
			// if the word-state is not active, dont render progresbar
			if (row.state === "active"){
				hideAttr = '';
				hits = parseFloat(row.hits) / parseFloat(chrome.extension.getBackgroundPage().settings.get('learnedTreshold')) * 100; 
			}else{
				hideAttr = 'hidden';
				hits = -1;
			}

			// Add row to data table
			a = toLearnDT.fnAddData( [
				'<div id="word'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="word" >'+row.word+'</div>',
				'<div id="translation_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="translation">'+row.translation+'</div>',
				'<div id="description_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="description">'+row.description+'</div>',
				'<div class="hidden">'+ hits +'</div>' // added to enable column sorting
			+	'<div class="progress progress-success progress-striped active" '+ hideAttr +'>'
			+	  '<div class="bar" style="width:'+hits+'%;"></div>'
			+	'</div>',
				'<div class="btn-group">'
			+		'<button type="button" class="btn play-btn" '+ (isOnline() ? "" : "disabled='disabled'") +'><i href="#" class="icon-play" ></i></button>'
			+		'<button id="archiveRowBtn" type="button" class="btn"><i href="#" class="icon-ok" ></i></button>'
			+		'<button id="delRowBtn" type="button" class="btn"><i href="#" class="icon-trash" ></i></button>'
			+	'</div>'] ); 
			
			// Add attributes to the added row 
			cRowElement = toLearnDT.fnSettings().aoData[ a ].nTr;
			$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
		}
	
	},
	learned: {
		load: function(tx, rs) {
			"use strict"
			for (var i=rs.rows.length-1; i >= 0 ; i--) {
				dTable.learned.renderRow(rs.rows.item(i));
			}
		},
		renderRow: function(row) {
			"use strict"
			var  cRowElement;
			// Add row to data table
			var a = learnedDT.fnAddData( [
				'<div id="word'+ row.id +'" class="" lt_dbLinked="word" >'+row.word+'</div>',
				'<div id="translation_'+ row.id +'" class="" lt_dbLinked="translation">'+row.translation+'</div>',
				'<div id="description_'+ row.id +'" class="" lt_dbLinked="description">'+row.description+'</div>',
				'<div class="btn-group">'
			+		'<button type="button" class="btn play-btn" '+ (isOnline() ? "" : "disabled='disabled'")  +'><i href="#" class="icon-play" ></i></button>'
			+		'<button id="repeatBtn" type="button" class="btn"><i href="#" class="icon-repeat" ></i></button>'
			+	'</div>'] ); 
			
			// Add attributes to the added row 
			cRowElement = learnedDT.fnSettings().aoData[ a ].nTr;
			$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
		}
		
	}
}


///////////////////////////////////////
// caret position jQuery plugin
$.fn.selectRange = function(start, end) {
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};
// ----------------------------------


/*
function newEntryCallback(tx, rs){ 
	"use strict"
	// BLINK confirmation message to the user
	newWord.clearWornings();
	$('div.add-word-form').find('textarea, input, .editable').val('').text('');				// reset values
	//$('#sucessAlert').fadeIn("slow").fadeOut('slow');
	chrome.extension.getBackgroundPage().db.tx({name: 'get_n_where', colName: 'id', colVal: rs.insertId, limit: '1'}, dTable.toLearn.load); // load entered value to data table
	$('#word').focus();
}*/
/*function clearNewWordWornings(){
	$('div.add-word-form').find('.warning').removeClass('warning');  	// remove all warning coloring
	$('div.add-word-form').find('.help-inline').hide();					// hide all warning helpers
}*/


/*
function loadToLearnDbEntriesCallback (tx, rs) {
	"use strict"
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		renderToLearnRow(rs.rows.item(i));
	}
}*/
/*
function loadLearnedDbEntriesCallback (tx, rs) {
	"use strict"
	for (var i=rs.rows.length-1; i >= 0 ; i--) {
		renderLearnedRow(rs.rows.item(i));
	}
}*/
/*
function renderToLearnRow(row) {
	"use strict"
	var hits, cRowElement, a, hideAttr;
	
	// if the word-state is not active, dont render progresbar
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
		'<div class="btn-group">'
	+		'<button type="button" class="btn play-btn" '+ (isOnline() ? "" : "disabled='disabled'") +'><i href="#" class="icon-play" ></i></button>'
	+		'<button id="archiveRowBtn" type="button" class="btn"><i href="#" class="icon-ok" ></i></button>'
	+		'<button id="delRowBtn" type="button" class="btn"><i href="#" class="icon-trash" ></i></button>'
	+	'</div>'] ); 
	
	// Add attributes to the added row 
	cRowElement = toLearnDT.fnSettings().aoData[ a ].nTr;
	$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
}
*//*
function renderLearnedRow(row) {
	"use strict"
	var  cRowElement;
	// Add row to datatable
    var a = learnedDT.fnAddData( [
        '<div id="word'+ row.id +'" class="" lt_dbLinked="word" >'+row.word+'</div>',
        '<div id="translation_'+ row.id +'" class="" lt_dbLinked="translation">'+row.translation+'</div>',
        '<div id="description_'+ row.id +'" class="" lt_dbLinked="description">'+row.description+'</div>',
		'<div class="btn-group">'
	+		'<button type="button" class="btn play-btn" '+ (isOnline() ? "" : "disabled='disabled'")  +'><i href="#" class="icon-play" ></i></button>'
	+		'<button id="repeatBtn" type="button" class="btn"><i href="#" class="icon-repeat" ></i></button>'
	+	'</div>'] ); 
	
	// Add attributes to the added row 
	cRowElement = learnedDT.fnSettings().aoData[ a ].nTr;
	$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
}
*/
/*function removeFromDataTable(entryId, table){
	"use strict"
	var rowPos = table.fnGetPosition( $('tr.table-row[lt_dbLinked='+entryId+']')[0] );
	if(rowPos!==null){
	  table.fnDeleteRow(rowPos);  // delete row
    }
}*/