$(function(){
	showButtons();
	initListeners();
});

function getBg(){
	return chrome.extension.getBackgroundPage();
}

function showButtons(){
	var mynWords = getBg().notification.nFetchedWords;
	console.log('mynWords ' + mynWords);
	if(mynWords === 0){
		$('.noWords').removeClass('hidden');
	} else {
		$('button#startPracticeBtn').removeClass('hidden');
	}
}

function initListeners(){
	// START button
	$('button#startPracticeBtn').click(function(){
		console.log('should open the practice window');
		getBg().notification.closeAll(); // close all notifications
		getBg().practice.start();
	});
	
	// SNOOZE button
	$('button#snoozePracticeBtn').click(function(){
		getBg().notification.closeAll();
		
	});
	
	// ADD WORDS button
	$('button#addWordsPracticeBtn').click(function(){
		getBg().notification.closeAll();
		getBg().practice.addWords();
	});
}