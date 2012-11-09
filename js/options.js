$(function(){
	init.all();
});

var init = {
	all: function(){
		newWordForm.disable();
		init.selectTab();
		init.defaultSettings();
		init.dataTables();
		init.modal();
		//loadDictEntries();  // will be called from loadDictionaries() once the table is selected
		init.listeners();
	},
	selectTab: function(){
		var url = document.location.toString();
		if (url.match('#')) {
			$('.nav-tabs a[href=#'+url.split('#')[1]+']').tab('show');
		} 
	},
	defaultSettings: function(){
		"use strict"
		// buttons init
		$('button.settings-btn').each(function(){
			var oKey, oValue, lsValue;
			oKey = $(this).attr('data-lskey');
			oValue = $(this).attr('data-lsvalue');
			lsValue = getBg().ls.get(oKey);
			if (oValue === lsValue){
				$(this).button('toggle');
				console.log('[Info] Loaded and initialized button '+oKey+' with value ' + lsValue)
			}
		});
		// fields init
		$('input.settings-input').each(function(){
			var oKey, lsValue;
			oKey = $(this).attr('data-lskey');
			lsValue = getBg().ls.get(oKey);
			$(this).val(lsValue);
			console.log('[Info] Loaded and initialized input field '+oKey+' with value ' + lsValue)
		});
	},
	dataTables: function(){
		"use strict"
		dTable.init();  // init data tables
	},
	modal: function(){
		"use strict"
		for (var i = 0; i< googleTranslate.languageList.length; i++){
			$('#nativeLang, #toLearnLang').append('<option value="'+ googleTranslate.languageList[i].abbr +'">'+ googleTranslate.languageList[i].name +'</option>');
		}
	},
	listeners: function(){
		"use strict"
		///////////////////////////////////////
		// ADD NEW WORD BUTTON listener
		$('.add-word-form').on('click', '#addNewEntryBtn', function(evt){
			var word, translation, example;
			word = $(this).closest('div.add-word-form').find('#word');
			translation = $(this).closest('div.add-word-form').find('#translation');
			example =  $(this).closest('div.add-word-form').find('#description');
			
			if ((word.val().length !== 0) & (translation.val().length !== 0)){
				getBg().db.tx({	name: 'add_entry', 
								word: word.val(),
								translation: translation.val(),
								description: example.val()
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
		}).on('keyup', '#word', function(){
			var word, activeTable;
			word = $(this).val();
			activeTable = util.getActiveTable();
			if (word.length && googleTranslate.isAudioPlayable(activeTable.iLearn)){
				$('button#playWordBtn').removeClass('hidden');
			}else{
				$('button#playWordBtn').addClass('hidden');
			}
		}).on('click', '#playWordBtn', function(){
			googleTranslate.playWord($('#word').val(), util.getActiveTable().iLearn);
		
		}).on('keypress', '#word, #translation', function(){
			$(this).closest('.control-group').removeClass('warning');
			$(this).siblings('.help-inline').hide();
		});
		
		//-----------------------------------------
		
		
		///////////////////////////////////////
		// DROPDOWN handling
		$('#tabsContainer').on('change', '.word-box', function(){	
			var word, activeTable, forFieldId;
			forFieldId = $(this).attr('data-for');
			word = $(this).val() || $(this).text();
			//console.log('box changed. should create dropdown for word: ' + word);
			activeTable = util.getActiveTable();
			if (word.length){
				console.log('[Info] Sending request for translation: ' + activeTable.iSpeak + ' | ' + activeTable.iLearn);
				googleTranslate.translationRequest(activeTable.iLearn, activeTable.iSpeak, word, forFieldId, newWordForm.handleTranslation, []);
			}
		}).on('focus', '.translation-box', function(){
			translationDropdown.show($(this));
		}).on('click', '.translation-box', function(e){
			e.stopPropagation();
		}).on('click', '.addword-dropdown', function(e){  // handler when clicked on dropdown
			//console.log(e.which);
			//if (e.type === 'keyup' && e.which != 13) return;
			var wordToAdd, $field;
			wordToAdd = $(this).text().trim().toLowerCase();
			$field = $(this).closest('div.dropdown').find('.translation-box');
			translationDropdown.onClick(wordToAdd, $field);
		});
		//-----------------------------------------
		
		
		///////////////////////////////////////
		// Detect DIV BOX EDITING; store edited entry {adding listeners for contenteditable & updating data on change]
		var before='';
		$('#toLearnTable').on('focus', 'div.editable', function(){
			before = $(this).text();
		}).on('blur', 'div.editable', function(){
			if (before !== $(this).text()){
				$(this).trigger('change');
				console.log('editable is blured, after= '+$(this).text());
			}
		}).on('change', 'div.editable', function(){
			var dbColumnName, rowId, boxId;
			console.log('[Info] Editable field changed! Storing to db.');
			dbColumnName = $(this).attr('lt_dbLinked');
			rowId =  $(this).closest('tr.table-row').attr('lt_dbLinked');
			boxId = $(this).attr('id');
			getBg().db.tx({ 	name: 'edit_entry', 
						editedColumn: dbColumnName,  
						newValue: $(this).html(), 
						id: rowId
					}, dTable.editCell_cb(boxId) );
				
		}).on('click', 'button.del-row-btn', function(e){	// bind event listener for DELETE row tooltip
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
				title: function(){ return 'Delete word <strong>'+ $(this).closest('tr.table-row').find('div.editable[lt_dblinked="word"]').text() +'</strong>?';}
			})
			$(this).popover('show');
			e.stopPropagation();
		}).on('click', 'button.archive-row-btn', function(e){	// bind event listener for ARCHIVE row tooltip
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
		$('#learnedTable').on('click', 'button.repeat-row-btn', function(e){	// bind event listener for repeat word tooltip
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
		}).on('click', 'button.delete-word-btn', function(){ 	// DELETE Word button listener
			var rowId = $(this).attr('lt_dbLinked'); 
			getBg().db.tx({name: 'delete_entry', id: rowId}, dTable.toLearn.remove(rowId));
			$(this).closest('div.popover').remove();
			
		}).on('click', 'button.archive-word-btn', function(){  // ARCHIVE Word button listener
			//var dbId = $(this).attr('lt_dbLinked');
			var dbColumnName, rowId;
			dbColumnName = 'state';
			rowId = $(this).attr('lt_dbLinked');
			getBg().db.tx({ 	name: 'edit_entry', 
								editedColumn: dbColumnName,  
								newValue: 'learned', 
								id: rowId
							}, dTable.toLearn.remove(rowId) );
			// show the entry in the learned table
			getBg().db.tx({name: 'get_where', colName: 'id', colVal: rowId}, dTable.learned.load);	
			$(this).closest('div.popover').remove();
			
		}).on('click', 'button.repeat-word-btn', function(){  // REPEAT Word button listener
			var rowId = $(this).attr('lt_dbLinked');
			getBg().db.tx({ 	name: 'repeat_entry', 
								id: rowId
							}, dTable.learned.remove(rowId) );
			// show entry in the toLearn table
			getBg().db.tx({name: 'get_where', colName: 'id', colVal: rowId}, dTable.toLearn.load);	
			$(this).closest('div.popover').remove();
			
		}).on('click', 'button.del-table-popup-btn', function(){  // DELETE TABLE button listener
			var myTableName = $(this).attr('lt_dbLinked');
			getBg().db.tx({ 	name: 'drop_table', 
								tableName: myTableName
							}, dTable.dicts.remove(myTableName) );
			$(this).closest('div.popover').remove();
			
		}).on('click', 'button.cancel-popup-btn', function(){	// CANCEL button
			$(this).closest('div.popover').fadeOut();
			
		}).on('click', 'button.play-btn', function(){			// PLAY button
			var txt = $(this).closest('tr.table-row').find('div.[lt_dblinked="word"]').text();
			googleTranslate.playWord(txt, util.getActiveTable().iLearn);
		});
		
		///////////////////////////////////////
		// Settings
		$('#settingsContainer').on('keyup', '.numerical-uint', function(){
			this.value = this.value.replace(/[^0-9]/g,'');
		}).on('change', '.settings-input', function(){
			var key, value;
			key = $(this).attr('data-lskey');
			value = $(this).val();
			
			if(key.length){
				if (value === ''){  // no number inserted, restore from ls
					$(this).val(getBg().ls.get(key));
					console.log('[Info] Value for settings '+ key + ' restored from ls');
				} else {
					getBg().ls.set($(this).attr('data-lskey'), value);
					//$(this).closest('.controls').find('.slider-number').text($(this).val());
					console.log('[Info] Settings'+key +' changed to '+value);
				}
			} else {
				console.log('[Info] Settings key doesnt exists for this field');
			}
		}).on('click', 'button.settings-btn', function(){  // settings buttons in general
			getBg().ls.set($(this).attr('data-lskey'), $(this).attr('data-lsvalue'));
			console.log('[Info]' + $(this).attr('data-lskey') +' changed to ' + $(this).attr('data-lsvalue'));
		}).on('click', 'button.lt-toggle-btn', function(){
			getBg().ls.set($(this).attr('data-lskey'), $(this).attr('data-lsvalue'));
			console.log('[Info]' + $(this).attr('data-lskey') +' changed to ' + $(this).attr('data-lsvalue'));
		}).on('click', '.add-table-btn', function(){
			util.openAddDictionaryModal();
		}).on('click', '#createNewTableBtn', function(){
			var modal, myTableName;
			modal = $(this).closest('#addTableModal');
			
			myTableName =  modal.find('#nativeLang').val() + '_'+ modal.find('#toLearnLang').val() +'_' + Math.random().toString(36).substr(2, 9);
			console.log('[Info] About to create new table with name "' +myTableName +'"');
			getBg().db.tx({ 	name: 'create_table', 
								tableName: myTableName
							}, dTable.dicts.renderRow({name: myTableName})); 
			dTable.dicts.selectActive();
			$('#addTableModal').modal('hide');
		}).on('click', '.del-table-btn', function(e){
			$('div.popover').fadeOut().remove();
			$(this).popover({
				placement: 'top', 
				trigger: 'manual',
				html: 'true',
				content: function(){ 
					return '<div class="row-fluid">'
						+	  '<button type="button" class="del-table-popup-btn btn btn-primary btn-danger span6" lt_dblinked="'+$(this).closest('tr').attr('lt_dblinked')+'">Yes</button>'
						+	  '<button type="button" class="cancel-popup-btn btn span6">Cancel</button>'
						+	'</div>'},
				title: function(){ return 'Delete dictionary <strong>'+ $(this).closest('tr.table-row').find('.table-name').text() +'</strong>?'}
			})
			$(this).popover('show');
			e.stopPropagation();
		}).on('click', '.save-table-btn', function(e){
			var myTableName = $(this).closest('tr.table-row').attr('lt_dblinked');
			console.log('[Info] Save table ' + myTableName);
			getBg().db.tx({ name: 'get_all_entries', 
							tableName: myTableName
							}, function(tx, rs){
								saveToXml.render(rs, myTableName);
							}); 
			
		}).on('click', '.activate-table-radio', function(){
			var currTable, tableName_array;
			$('#dictionariesTable').find('tr.table-row').removeClass('info');
			// make row highlighted
			$(this).closest('tr.table-row').addClass('info');
			currTable = getBg().ls.get($(this).attr('data-lskey'));
			// store active table
			currTable.name = $(this).val();
			tableName_array = currTable.name.split(/[_]+/);
			currTable.iSpeak = tableName_array[0];
			currTable.iLearn = tableName_array[1];
			currTable.hasAudio = googleTranslate.getAttrValue(currTable.iLearn, 'hasAudio');
			getBg().ls.set($(this).attr('data-lskey'), currTable);
			
			newWordForm.enable();
			newWordForm.resetFields();
			newWordForm.insertPlaceholders();
			
			// load data to toLearn & Learned tables
			dTable.loadEntries();
			console.log('[Info] Clicked radio to set active table: ' + $(this).val());
		});

		$('[rel="tooltip"]').tooltip();
		//-----------------------------------------
		
		///////////////////////////////////////
		// Remove popovers when user click elsewhere
		$(document).click(function(){
		  $('div.popover').remove();
		  $('div.dropdown').removeClass('open');
		});
		//-----------------------------------------
		
		util.updateConnectionStatus();  // first init
		$(window).on('online', function(e){
			util.updateConnectionStatus(true);
		}).on('offline', function(e){
			util.updateConnectionStatus(false);
		});
	}
}

var translationDropdown = {
	create: function(gtWords, $field){
		var dropdownMenuStream = '';
		if (typeof gtWords !== 'undefined'){		// word alternative translations handling
			dropdownMenuStream = '<ul class="dropdown-menu" role="menu" aria-labelledby="translation">';
			gDescription_array = new Array();
			$.each(gtWords, function(index, value){  
				dropdownMenuStream += '<li><div class="category"><strong>' + value.pos + '</strong></div></li>';
				$.each(value.entry, function(index, value){
					//if (gTranslation !== value.word )
					dropdownMenuStream +='<li><a class="addword-dropdown" tabindex="-1" class="category">' +value.word + '</a></li>';
				});
			});
			dropdownMenuStream += '</ul>'
			$field.closest('div.dropdown').append(dropdownMenuStream);
			console.log('[Info] Created dropdown menu');
		}
	},
	show: function($field){
		$field.closest('div.dropdown').addClass('open');
	},
	onClick: function(wordToAdd, $field){
		var translationContent, translationContent_array, lastChar, caretStart, caretEnd;
		translationContent = $field.val().trim() || $field.text().trim();
		//console.log('on click translationContent: ' + translationContent)
		translationContent_array = translationContent.replace(/\s+/g, '').toLowerCase().split(/[;,.]+/);
		
		if ($.inArray(wordToAdd.replace(/\s+/g, ''), translationContent_array) === -1) {  // add word if not present in field
			lastChar = translationContent.charAt( translationContent.length-1 );
			if(translationContent === "" || lastChar === ',' || lastChar === '.' || lastChar === ';'){
				$field.val(translationContent + ' ' + wordToAdd);
				$field.text(translationContent + ' ' + wordToAdd);
			} else {
				$field.val(translationContent + ', ' + wordToAdd);
				$field.text(translationContent + ', ' + wordToAdd); // Merge with other content
			}
			caretStart = caretEnd = $field.val().length || $field.text().length; // set caret to the end
		}else{
			caretStart = $field.val().indexOf(wordToAdd) || $field.text().indexOf(wordToAdd);  // mark existing word
			caretEnd = caretStart + wordToAdd.length;
			
		}
		console.log('caretStart: ' + caretStart + 'caretEnd: '+caretEnd);
		$field.focus();
		$field.selectRange(caretStart,caretEnd);
		
	},
	remove: function($field){
		$field.closest('div.dropdown').find('ul.dropdown-menu').remove();
	}
}

var saveToXml = {
	render: function(rs, tableName){
	var row;
		if (rs.rows.length) {
			var xw = new XMLWriter('UTF-8');
			xw.formatting = 'indented';//add indentation and newlines
			xw.indentChar = ' ';//indent with spaces
			xw.indentation = 2;//add 2 spaces per level

			xw.writeStartDocument( );
			// xw.writeDocType('"items.dtd"');
			xw.writeStartElement('dictionary');
			xw.writeAttributeString('name', tableName);
			for (var i=rs.rows.length-1; i >= 0 ; i--) {
				row = rs.rows.item(i);
				//console.log(row);
				xw.writeStartElement( 'word' );
					xw.writeElementString('id', row.id.toString());
					xw.writeElementString('foreign', row.word);
					xw.writeElementString('known', row.translation);
					xw.writeElementString('example', row.description);
					xw.writeElementString('state', row.state);
					xw.writeElementString('hits', row.hits.toString());
					xw.writeElementString('tries', row.tries.toString());
					xw.writeElementString('trend', row.trend.toString());
					xw.writeElementString('created', row.created);
					xw.writeElementString('modified', row.modified);
				xw.writeEndElement();
			}
			xw.writeEndElement();
			xw.writeEndDocument();
		} else{
			console.log('[Warning] There are no words to save in table '+ tableName);
		}
	
		saveToXml.download(xw.flush(), tableName);
		
	},
	download: function(urlString, fileName) {
		console.log('[Info] About to download table');
		window.URL = window.webkitURL || window.URL;
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
		file = new WebKitBlobBuilder();
		file.append(urlString);
		var a = document.createElement('a');
		a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
		a.download = fileName + '.xml';
		a.style.display = 'none';
		//a.textContent = 'Download file!';
		a.setAttribute('id', 'tableDwnLink');
		document.body.appendChild(a);
		a.click();
		$(a).remove();
	}
}

var newWordForm = {
	add_cb: function(tx, rs){ 
		"use strict"
		// BLINK confirmation message to the user
		newWordForm.clearWornings();
		newWordForm.resetFields();
		newWordForm.indicateSucess();
		getBg().db.tx({name: 'get_n_where', colName: 'id', colVal: rs.insertId, limit: '1'}, dTable.toLearn.load); // load entered value to data table
		$('#word').focus();
	},
	enable: function(){
		$('#word, #translation, #description, #addNewEntryBtn').prop("disabled", false);
	},
	disable: function(){
		$('#word, #translation, #description, #addNewEntryBtn').prop("disabled", true);
	},
	clearWornings: function(){
		$('div.add-word-form').find('.warning').removeClass('warning');  	// remove all warning coloring
		$('div.add-word-form').find('.help-inline').hide();					// hide all warning helpers
	},
	resetFields: function(){
		$('div.add-word-form').find('textarea, input, .editable').val('').text('');				// reset values
		$('#playWordBtn').addClass('hidden');
		translationDropdown.remove($('#translation'));
	},
	insertPlaceholders: function(){
		var activeTable = util.getActiveTable();
		if ((activeTable.iLearn !== null) && (activeTable.iSpeak !== null)){
			$('input#word').attr('placeholder', googleTranslate.getAttrValue(activeTable.iLearn, 'name') + '...');
			$('textarea#translation').attr('placeholder', googleTranslate.getAttrValue(activeTable.iSpeak, 'name') + '...');
		} else {
			$('input#word').attr('placeholder', '');
			$('textarea#translation').attr('placeholder', '');
		}
	},
	indicateSucess: function(){
		//$('#sucessAlert').fadeIn("slow").fadeOut('slow');
		console.log('word added to db');
	
	},
	handleTranslation: function(resp, fieldId){
		//console.log(resp);
		var $field = $('#'+fieldId);
		translationDropdown.remove($field);  // first remove the existing dropdown translations
		
		if (typeof resp.sentences !== 'undefined' && fieldId === 'translation'){	// Translation handling for new word
			if (resp.sentences[0].trans.toLowerCase() !== $('#word').val().toLowerCase()){  // if word not equal to orig.
				$('#translation').val(resp.sentences[0].trans);
				console.log('[Info] Added translation to translation field.');
			} else {
				$('#translation').val('');
				console.log('[Info] Same translation as original word.');
			}
		}
		translationDropdown.create(resp.dict, $field);  // create dropdown with alternative translations
	}
}

var toLearnDT, learnedDT, dictsDT; 
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
		dictsDT = $('table#dictionariesTable').dataTable( {
			"sDom": '<"clear">',
			"sPaginationType": "bootstrap",
			"iDisplayLength": 50,
			"oLanguage": {
				"sLengthMenu": "_MENU_ words per page"
			},
			"bFilter": false,
			"bAutoWidth": false,
			/*"aoColumnDefs": [
			  { 'bSortable': false, 'aTargets': [ 3 ] } // make it not sortable
			]*/
		} );
		
		getBg().db.tx({name: 'get_all_tables'}, dTable.dicts.load);	// load dicts
	},
	loadEntries: function(){  // former loadDictEntries
		"use strict"
		dTable.removeEntries();
		
		getBg().db.tx({name: 'get_where', colName: 'state', colVal: 'active'}, dTable.toLearn.load);
		getBg().db.tx({name: 'get_where', colName: 'state', colVal: 'waiting'}, dTable.toLearn.load);
		getBg().db.tx({name: 'get_where', colName: 'state', colVal: 'learned'}, dTable.learned.load);

		
		//getBg().db.tx({name: 'get_all_tables'}, dTable.dicts.load);
	},
	removeEntries: function(){
		if (typeof toLearnDT !== 'undefined' ) // if datatable already defined/loaded, remove its content
			toLearnDT.fnClearTable();
		if (typeof learnedDT !== 'undefined')	
			learnedDT.fnClearTable();
			
		dTable.updateTabName('all');
		
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
	updateTabName: function(table){
		"use strict"
		switch (table){
		case 'toLearn':
			$("#nToLearnInd").text(dTable.toLearn.length());
		break;
		case 'learned':
			$("#nLearnInd").text(dTable.learned.length());
		break;
		default:
			$("#nToLearnInd").text(dTable.toLearn.length());
			$("#nLearnInd").text(dTable.learned.length());
		}
	},
	toLearn: {
		load: function(tx, rs) {
			"use strict"
			//toLearnDT.fnClearTable();
			if (rs.rows.length) {
				for (var i=rs.rows.length-1; i >= 0 ; i--) {
					dTable.toLearn.renderRow(rs.rows.item(i));
				}
			} else{
				console.log('[Warning] There are no words with status "toLearn" in this table');
			}
			dTable.updateTabName('toLearn');
		},
		remove: function(entryId){
			"use strict"
			var rowPos = toLearnDT.fnGetPosition( $('tr.table-row[lt_dbLinked='+entryId+']')[0] );
			if(rowPos!==null){
			  toLearnDT.fnDeleteRow(rowPos);  // delete row
			}
			dTable.updateTabName('toLearn');
		},
		renderRow: function(row) {
			"use strict"
			var hits, cRowElement, a, hideAttr, audioBtnHtml;
			
			// if the word-state is not active, dont render progresbar
			if (row.state === "active"){
				hideAttr = '';
				hits = parseFloat(row.hits) / parseFloat(getBg().ls.get('learnedTreshold')) * 100; 
			}else{
				hideAttr = 'hidden';
				hits = -1;
			}
			
			audioBtnHtml = googleTranslate.getAttrValue(util.getActiveTable().iLearn, 'hasAudio') ? '<button class="btn play-btn connection-dependent" type="button" '
						+ (navigator.onLine ? '' :  'disabled')+'><i href="#" class="icon-play" ></i></button>' : '';	

			// Add row to data table
			a = toLearnDT.fnAddData( [
				'<div id="word'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="word" data-for="translation_'+ row.id +'">'+row.word+'</div>',
				'<div class="dropdown">'
				+	'<div id="translation_'+ row.id +'" class="editable" contenteditable="true" lt_dbLinked="translation">'+row.translation+'</div>'
				+'</div>',
				'<div id="description_'+ row.id +'" class="editable example-box" contenteditable="true" lt_dbLinked="description">'+row.description+'</div>',
				//'<span class="trend-chart">'+row.trend+'</span>',
				'<div class="hidden">'+ hits +'</div>' // added to enable column sorting
			+	'<div class="progress progress-success progress-striped active" '+ hideAttr +'>'
			+	  '<div class="bar" style="width:'+hits+'%;"></div>'
			+	'</div>',
				'<div class="btn-group">'
			+		audioBtnHtml 
			+		'<button class="btn archive-row-btn" type="button"><i href="#" class="icon-ok" ></i></button>'
			+		'<button class="btn del-row-btn" type="button"><i href="#" class="icon-trash" ></i></button>'
			+	'</div>'] ); 
			
			// Add attributes to the added row 
			cRowElement = toLearnDT.fnSettings().aoData[ a ].nTr;
			$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
		},
		length: function(){
			return toLearnDT.fnSettings().fnRecordsTotal();
		}
	
	},
	learned: {
		load: function(tx, rs) {
			"use strict"
			if (rs.rows.length) {
				for (var i=rs.rows.length-1; i >= 0 ; i--) {
					dTable.learned.renderRow(rs.rows.item(i));
				}
			} else {
				console.log('[Warning] There are no words with status "learned" in the table');
			}
			dTable.updateTabName('learned');
		},
		remove: function(entryId){
			"use strict"
			var rowPos = learnedDT.fnGetPosition( $('tr.table-row[lt_dbLinked='+entryId+']')[0] );
			if(rowPos!==null){
			  learnedDT.fnDeleteRow(rowPos);  // delete row
			}
			dTable.updateTabName('learned');
		},
		renderRow: function(row) {
			"use strict"
			var  cRowElement, a, audioBtnHtml;
			// Add row to data table
			audioBtnHtml = googleTranslate.getAttrValue(util.getActiveTable().iLearn, 'hasAudio') ? '<button class="btn play-btn connection-dependent" type="button" '+ (navigator.onLine? '' :  'disabled')+'><i href="#" class="icon-play" ></i></button>' : '';
			a = learnedDT.fnAddData( [
				'<div id="word'+ row.id +'" class="" lt_dbLinked="word" >'+row.word+'</div>',
				'<div id="translation_'+ row.id +'" class="" lt_dbLinked="translation">'+row.translation+'</div>',
				'<div id="description_'+ row.id +'" class="" lt_dbLinked="description">'+row.description+'</div>',
				//'<span class="trend-chart">'+row.trend+'</span>',
				'<div class="btn-group">'
			+		audioBtnHtml
			+		'<button class="btn repeat-row-btn" type="button"><i href="#" class="icon-repeat" ></i></button>'
			+	'</div>'] ); 
			
			// Add attributes to the added row 
			cRowElement = learnedDT.fnSettings().aoData[ a ].nTr;
			$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.id);
		},
		length: function(){
			return learnedDT.fnSettings().fnRecordsTotal();
		}
		
	},
	dicts: {
		load: function(tx, rs) {
			"use strict"
			var i, row;
			if (rs.rows.length) {
				console.log('[Info] dicts.load - Found '+rs.rows.length+' tables in database.');
				for (i = rs.rows.length-1; i >= 0 ; i--) {
					row = rs.rows.item(i);
					if (row.name !== "__WebKitDatabaseInfoTable__" && row.name !=="sqlite_sequence" && row.name !==""){
						dTable.dicts.renderRow(rs.rows.item(i));
					}
				}
				dTable.dicts.selectActive();
			} else {
				console.log('[Warning] dicts.load - There is no table in database. Opening modal window.');
				util.openAddDictionaryModal();
			}
		},
		remove: function(entryId){
			"use strict"
			var rowToDelete, rowPos;//, isActive;
			rowToDelete = $('tr.table-row[lt_dbLinked='+entryId+']');
			rowPos = dictsDT.fnGetPosition( rowToDelete[0] );
			// isActive = $('.table-row').find('input.activate-table-radio').prop('checked');
			if(rowPos !== null){
			  dictsDT.fnDeleteRow(rowPos);  // delete row
			  dTable.dicts.selectActive();
			}
			dTable.removeEntries();
			newWordForm.insertPlaceholders();
			// dTable.loadEntries();
		},
		renderRow: function(row) {
			"use strict"
			var  cRowElement, tName_array, a;
			tName_array = row.name.toUpperCase().split(/[_]+/);
			// Add row to data table
			a = dictsDT.fnAddData( [
				'<label class="radio">'
				+	'<input class="activate-table-radio" type="radio" name="selectTable" data-lskey="activeTable" value="'+ row.name +'" >'
				+	'<span class="label label-info table-name">Learn '+ googleTranslate.getAttrValue(tName_array[1], 'name') +'</span>'
				+'</label>',
				'<div class="" lt_dbLinked="nativeLang">'
				+	'<span class="label-from-language">'+ googleTranslate.getAttrValue(tName_array[0], 'name') + '</span>'
				+'</div>',
				/*'<div class="" lt_dbLinked="toLearnLang">'
				+	'<span class="label-to-language">'+ googleTranslate.getAttrValue(tName_array[1], 'name') + '</span>'
				+'</div>',*/
				'<div class="btn-group">'
				+	'<button class="save-table-btn btn" type="button" ><i href="#" class="icon-download-alt"></i></button>'
				+	'<button class="del-table-btn btn" type="button" ><i href="#" class="icon-trash"></i></button><output></output>'
				+'</div>'	] ); 
			
			// Add attributes to the added row 
			cRowElement = dictsDT.fnSettings().aoData[ a ].nTr;
			$(cRowElement).addClass('table-row').attr('lt_dbLinked', row.name);
			
		},
		length: function(){
			return dictsDT.fnSettings().fnRecordsTotal();
		},
		selectActive: function(){
			var activeTable, radioBox;
			activeTable = util.getActiveTable();
			if (typeof activeTable.name !== 'undefined' && activeTable.name !== "" && activeTable.name !== null){
				radioBox = $('table#dictionariesTable').find('input[value="'+ activeTable.name +'"]')[0];
				if (typeof radioBox !== 'undefined'){
					console.log('[Info] selectActive - Found radio button with stored table name and made active');
					$(radioBox).click();  //.prop('checked', true)
				} else {  // no radio button with that name - > select first radio in table
					radioBox = $('table#dictionariesTable').find('input[type="radio"]').first()[0];
					if (typeof radioBox !== 'undefined'){
						console.log('[Info] selectActive - Not found radio button with stored table name, marked active the first found');
						$(radioBox).click();  //.prop('checked', true)
					} else {
						console.log('[Warning] selectActive - Not found radio button with stored table name nor there is radio buttons in the table');
						getBg().ls.set('activeTable', getBg().ls.defaultSettings.activeTable);
						newWordForm.disable();
						util.openAddDictionaryModal();
					}
				}
			}else{ // no table name defined
				console.log('[Warning] selectActive - Stored table name is undefined or empty or null. ');
				radioBox = $('table#dictionariesTable').find('input[type="radio"]').first()[0];
				if (typeof radioBox !== 'undefined'){
					console.log('[Info] selectActive - Not found radio button with stored table name, first radio found marked active.');
					$(radioBox).prop('checked', true).click();
				} else {
					console.log('[Warning] selectActive - Not found radio button with stored table name nor there is radio buttons in the table');
					getBg().ls.set('activeTable', getBg().ls.defaultSettings.activeTable); // restore default name
					newWordForm.disable();
					util.openAddDictionaryModal()
				}
			}
		}
		
	}
}

var util= {
	getActiveTable: function(){
		return getBg().ls.get('activeTable');
	},
	updateConnectionStatus: function(){
		"use strict"
		if (navigator.onLine){	// if online
			console.log('[Info] We are online.');
			$('.connection-dependent').prop("disabled", false);
		} else {
			console.log('[Info] We are offline.');
			$('.connection-dependent').prop("disabled", true);
		}
	},
	openAddDictionaryModal: function(){
		$('.nav-tabs a[href=#settingsTab]').tab('show');
		$('#addTableModal').modal();
		$('#toLearnLang').focus();
	}
}

function getBg(){
	"use strict"
	return chrome.extension.getBackgroundPage();
}

/*chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action === 'addWord'){  // Called from practice page in order to send the data
		console.log('[Info] Received word to add: ' + request.word);
		$('#word').val(request.word).change();
	}
});*/


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