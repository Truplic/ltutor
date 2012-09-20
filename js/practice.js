$(function(){

//var table = chrome.extension.getBackgroundPage().util.getPracticeTable();
//var data = JSON.parse(window.location.hash.substr(1));

initListeners();
//chrome.extension.getBackgroundPage().send();
});
var start;
function initListeners(){
	/*$('#checkBtn').click(function(){
		
	});
*/
start = new Date().getTime();
	chrome.extension.getBackgroundPage().practice.sendSessionData();
}
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	$('#tLoading').text('Data loaded in ' + (new Date().getTime() - start) + 'ms');
	session.dataArray = request;
	
	$('#word').html(request[0].word);
	$('#description').html(request[0].description);
	console.log(request);
	//alert('data received');
});

session = {
	received: false,
	data: ''


}