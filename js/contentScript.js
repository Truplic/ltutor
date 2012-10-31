$(function(){

initListeners();

});

function initListeners(){
	$(document).dblclick(function(e){
		var sel = window.getSelection().toString();
		console.log(sel);
		//console.log($(e.target));

		if (sel.trim().length){
			$(e.target).popover({
				left: 5,
				top: 100,
				placement: 'bottom',
				trigger: 'manual',
				html: 'true',
				content: function(){ 
					return '<form class="form-horizontal">'
							+		'<input id="word" class="" type="text" placeholder="word" style="width:195px">'
							+		'<textarea class="dropdown-toggle" id="translation" data-toggle="dropdown" placeholder="translation" style="width:195px"></textarea>'
							+		'<textarea  id="description" placeholder="Example" style="width:195px"></textarea>'
							+'</form>';},
				title: function(){return '<table width="100%">'
										+	'<tr>'
										+	'<td><button type="button" class="btn">Close</button></td>'
										+	'<td><div style="text-align: center; color: black;"><strong>Add Word</strong></div></td>'
										+	'<td style="text-align: right"><button type="button" id="addNewEntryBtn" class="btn">Add</button></td>'
										+	'</tr>'
										+'</table>'},
			});
			$('div.popover').remove();
			$(e.target).popover('show');
			//$('div.popover').css('top', e.pageY);
			//$('div.popover').css('left', (e.pageX - $('div.popover').css('width')/2));
			$('div.popover').find('input#word').val(sel);
			
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

