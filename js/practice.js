$(function(){

//var table = chrome.extension.getBackgroundPage().util.getPracticeTable();
var data = JSON.parse(window.location.hash.substr(1));
console.log('#data:  '+data.length);
console.log(data);
//console.log('practice table is: ' + chrome.extension.getBackgroundPage().util.table);
initListeners();

});

function initListeners(){
	$('#checkBtn').click(function(){
		
	});
	$('#translation').keydown(function(event){
		event.stopPropagation();asd
	});
}


/*
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.msg === 'msg_to_Practice')
			alert("Message received in Practice !" + request.msg);
	}
);*/

	//console.log(window.location.hash.substr(1));
	//var data = JSON.parse(window.location.hash.substr(1));

	//console.log('var1 is ' + data.var1 + ' var2 is' + data.var2);
	//console.log('Fetch data from db ' + i);