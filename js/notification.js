$(function(){
	initListeners();
});

function initListeners(){
	// START button
	$('button#startPracticeBtn').click(function(){
		console.log('should open the practice window');
		chrome.extension.getBackgroundPage().notification.closeAll(); // close notification
		chrome.extension.getBackgroundPage().practice.newTab();
	});
	
	// SNOOZE button
	$('button#snoozePracticeBtn').click(function(){
		chrome.extension.getBackgroundPage().notification.closeAll();
		
	});
}