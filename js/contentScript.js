$(function(){
	initListeners();
	chrome.extension.sendMessage({action: "getLangInfo"});
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action === 'langInfo'){
			ltPopover.tabLang = request.tabLang;
			ltPopover.iSpeak = request.iSpeak;
			ltPopover.iLearn = request.iLearn;

			console.log('Tab language is:' + ltPopover.tabLang + ', Dict table is: '+ltPopover.iLearn);
		}
	});


});

function initListeners(){
	$(document).dblclick(function(e){
		var sel = window.getSelection().toString().trim();
		if (sel.length){
			ltPopover.selWord = sel;
			ltPopover.create(e);
			ltPopover.render(e);
		}
		
	}).click(function(){
		$('div.popover').remove();
	}).on('click', '.popover', function(e){
		e.stopPropagation();
	}).on('click', 'button#addNewEntryBtn', function(e){
		console.log('Should save data');
		var $popover = $(this).closest('div.popover');
		chrome.extension.sendMessage({action: "addWordToDict", word: $popover.find('input#word').val(), translation: $popover.find('textarea#translation').val(), example: $popover.find('textarea#description').val()});
		$popover.remove();
	}).on('click', 'button#ltPlayBtn', function(){
		console.log('[Info] Should play word' + ltPopover.selWord);
		googleTranslate.audio.play(ltPopover.iLearn, ltPopover.selWord, []);
	});

	
}

var ltPopover = {
	tabLang: '',
	iSpeak: '',
	iLearn: '',
	selWord: '',
	create: function(evt){
		$('div.popover').remove(); // first remove all existing
		$(evt.target).popover({
			template: '<div class="lt-style popover"><div class="arrow lt-style"></div><div class="lt-style popover-inner"><h3 class="lt-style popover-title"></h3><div class="lt-style popover-content"><p class="lt-style"></p></div></div></div>',
			left: 5,
			top: 100,
			placement: 'bottom',
			trigger: 'manual',
			html: 'true',
			content: function(){ 
				return '<form class="form-horizontal lt-style">'
						+		'<input id="word" class="lt-style word-box" type="text" placeholder="word">'
						+		'<textarea id="translation" class="lt-style translation-box" data-toggle="dropdown" placeholder="translation"></textarea>'
						+		'<textarea id="description" class="lt-style example-box" placeholder="Example"></textarea>'
						+'</form>';},
			title: function(){return '<table class="lt-style" width="100%">'
									+	'<tr>'
									+	'<td>'+ (googleTranslate.audio.isPlayable(ltPopover.iLearn)  ? '<button id="ltPlayBtn" type="button" class="lt-style btn">Play</button>' : '') +'</td>'
									+	'<td><div class="lt-style title" >Add Word</div></td>'
									+	'<td style="text-align: right"><button type="button" id="addNewEntryBtn" class="lt-style btn">Add</button></td>'
									+	'</tr>'
									+'</table>'},
		});
	},
	setValues: function(){
		// insert WORD
		$('div.popover').find('input#word').val(ltPopover.selWord);
		// insert TRANSLATION
		translation = googleTranslate.translate(ltPopover.iLearn, ltPopover.iSpeak, ltPopover.selWord, 'translation', function(resp, fieldId){
			if (typeof resp.sentences !== 'undefined' && fieldId === 'translation'){	// Translation handling for new word
				if (resp.sentences[0].trans.toLowerCase() !== $('#word').val().toLowerCase()){  // if word not equal to orig.
					$('#translation').val(resp.sentences[0].trans);
					console.log('[Info] Added translation to translation field.');
				} else {
					$('#translation').val('');
					console.log('[Info] Same translation as original word.');
				}
			}
		}, []);
	},
	correctPos: function(evt){
		$('div.popover').css('top', evt.pageY + 5);
		$('div.popover').css('left', (evt.pageX - 236/2)); // 236 is popover width defined in css
	},
	render: function(evt){
		$(evt.target).popover('show');
		ltPopover.correctPos(evt);
		ltPopover.setValues();
	}


}