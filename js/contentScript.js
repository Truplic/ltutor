$(function(){

initListeners();

});

function initListeners(){
	$(document).dblclick(function(e){
		var sel = window.getSelection().toString();
		console.log(sel);

		if (sel.trim().length){
			$(e.target).popover({
				left: 5,
				top: 100,
				placement: 'bottom',
				trigger: 'manual',
				html: 'true',
				content: function(){ 
					return '<form class="form-horizontal">'
							+		'<input id="word" class="cs word-box" type="text" placeholder="word" style="width:195px">'
							+		'<textarea id="translation" class="cs dropdown-toggle translation-box" data-toggle="dropdown" placeholder="translation" style="width:195px"></textarea>'
							+		'<textarea id="description" class="cs example-box" placeholder="Example" style="width:195px"></textarea>'
							+'</form>';},
				title: function(){return '<table class="cs" width="100%">'
										+	'<tr>'
										+	'<td><button id="ltPlayBtn" type="button" class="cs btn">Play</button></td>'
										+	'<td><div class="cs title" style="text-align: center; color: black;">Add Word</div></td>'
										+	'<td style="text-align: right"><button type="button" id="addNewEntryBtn" class="cs btn">Add</button></td>'
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

