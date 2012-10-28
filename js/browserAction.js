$(function(){
	initListeners();
});

function initListeners(){
	$('#runPractice').click(function(){
		chrome.extension.getBackgroundPage().practice.fetchSessionData(chrome.extension.getBackgroundPage().practice.start);
	});
	$('#runAddWord').click(function(){
		chrome.tabs.create({url: chrome.extension.getURL('options.html')});
	});
	$('#runDictionary').click(function(){
		chrome.tabs.create({url: chrome.extension.getURL('options.html')});
	});
	$('#runSettings').click(function(){
		chrome.tabs.create({url: chrome.extension.getURL('options.html')});
	});
}