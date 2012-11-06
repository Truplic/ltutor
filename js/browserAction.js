$(function(){
	initListeners();
});

function initListeners(){
	$('#runPractice').click(function(){
		var tableName = getBg().ls.get('activeTable').name;
		if (typeof tableName !== 'undefined' && tableName !== "" && tableName !== null){
			getBg().practice.fetchSessionData(getBg().practice.start);
		} else {
			chrome.tabs.create({url: chrome.extension.getURL('options.html#settingsTab')});
			console.log('[Info] There is no active table: '+ tableName + '. Opening options page to create one.');
		}
		
		
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

function getBg(){
	"use strict"
	return chrome.extension.getBackgroundPage();
}