$(function(){
	showButtons();
	initListeners();
});

function showButtons(){
	var mynWords = chrome.extension.getBackgroundPage().notification.nFetchedWords;
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
		chrome.extension.getBackgroundPage().notification.closeAll(); // close all notifications
		chrome.extension.getBackgroundPage().practice.start();
	});
	
	// SNOOZE button
	$('button#snoozePracticeBtn').click(function(){
		chrome.extension.getBackgroundPage().notification.closeAll();
		
	});
	
	// ADD WORDS button
	$('button#addWordsPracticeBtn').click(function(){
		chrome.extension.getBackgroundPage().notification.closeAll();
		chrome.extension.getBackgroundPage().practice.addWords();
	});
}