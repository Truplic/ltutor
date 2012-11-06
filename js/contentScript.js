$(function(){

initListeners();

});

function initListeners(){
	$(document).dblclick(function(e){
		var sel = window.getSelection().toString();
		console.log(sel);

		if (sel.trim().length){
			$(e.target).popover({
				template: '<div class="lt-style popover"><div class="arrow"></div><div class="lt-style popover-inner"><h3 class="lt-style popover-title"></h3><div class="lt-style popover-content"><p></p></div></div></div>',
				left: 5,
				top: 100,
				placement: 'bottom',
				trigger: 'manual',
				html: 'true',
				content: function(){ 
					return '<form class="form-horizontal">'
							+		'<input id="word" class="lt-style word-box" type="text" placeholder="word">'
							+		'<textarea id="translation" class="lt-style translation-box" data-toggle="dropdown" placeholder="translation"></textarea>'
							+		'<textarea id="description" class="lt-style example-box" placeholder="Example"></textarea>'
							+'</form>';},
				title: function(){return '<table class="lt-style" width="100%">'
										+	'<tr>'
										+	'<td><button id="ltPlayBtn" type="button" class="lt-style btn">Play</button></td>'
										+	'<td><div class="cs title" style="text-align: center; color: black;">Add Word</div></td>'
										+	'<td style="text-align: right"><button type="button" id="addNewEntryBtn" class="lt-style btn">Add</button></td>'
										+	'</tr>'
										+'</table>'},
			});

			$('div.popover').remove();  // remove existing popovers
			$(e.target).popover('show');
			$('div.popover').find('input#word').val(sel);
			$('div.popover').css('top', e.pageY + 5);
			$('div.popover').css('left', (e.pageX - 236/2)); // 236 is popover width defined in css

			
		}
		
	}).click(function(){
		$('div.popover').remove();
	}).on('click', '.popover', function(e){
		e.stopPropagation();
	}).on('click', 'button#addNewEntryBtn', function(e){
		console.log('Should save data');
		var $popover = $(this).closest('div.popover');
		console.log($popover);
		chrome.extension.sendMessage({action: "addWordToDict", word: $popover.find('input#word').val(), translation: $popover.find('textarea#translation').val(), example: $popover.find('textarea#description').val()});
		$popover.remove();
	});
}
/*
document.addEventListener('mouseup',function(event)
{
    var sel = window.getSelection().toString();
	console.log('selected text is:'  + sel);
    //if(sel.length)
        //chrome.extension.sendRequest({'message':'setText','data': sel},function(response){})
});*/

