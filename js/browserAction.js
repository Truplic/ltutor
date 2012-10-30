$(function(){
	initListeners();
});

function initListeners(){
	$('#runPractice').click(function(){
		chrome.extension.getBackgroundPage().practice.fetchSessionData(chrome.extension.getBackgroundPage().practice.start);
	});
	$('#runAddWord').click(function(){
		chrome.tabs.create({url: chrome.extension.getURL('options.html#addWordTab')});
	});
	$('#runDictionary').click(function(){
		chrome.tabs.create({url: chrome.extension.getURL('options.html#dictionaryTab')});
	});
	$('#runSettings').click(function(){
		chrome.tabs.create({url: chrome.extension.getURL('options.html#settingsTab')});
	});
}