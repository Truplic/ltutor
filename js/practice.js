$(function(){
//var table = chrome.extension.getBackgroundPage().util.getPracticeTable();
//var data = JSON.parse(window.location.hash.substr(1));
initListeners();
});
var start;
function initListeners(){
	"use strict"
	$('button#checkBtn').click(function(){
		practiceHandler.validate();
	});

	start = new Date().getTime();
	chrome.extension.getBackgroundPage().practice.getSessionData();
}
chrome.extension.onMessage.addListener(function(request_array, sender, sendResponse) {
	$('#tLoading').text('Data loaded in ' + (new Date().getTime() - start) + 'ms');
	practiceHandler.data_array = request_array;
	practiceHandler.insert();

	console.log(request_array);
});

practiceHandler = {
	data_array: new Array(),
	currentWord: 0,
	insert: function(){
		if (practiceHandler.data_array.length) {
			if(practiceHandler.currentWord !== practiceHandler.data_array.length){
				$('#word').html('<h4>' + practiceHandler.data_array[practiceHandler.currentWord].word + '</h4>' );
				$('#description').html(practiceHandler.data_array[practiceHandler.currentWord].description);
			}else{
				$('div.container').children().remove();
				$('div.practice-container').append('<div class="alert alert-success">'
					+ '<button type="button" class="close" data-dismiss="alert">&#215;</button><strong>Well done!! </strong> No more words to practice in this session. </div>');
			}

		} else {	// no fetched data
			$('div.container').children().remove();
			$('div.practice-container').append('<div class="alert alert-error">'
				+ '<button type="button" class="close" data-dismiss="alert">&#215;</button><strong>Error! No words to practice! </strong>For some reason the session data has not been fetched. Please reload the page.</div>');
		}
	},
	validate: function(){
		var myHits, orgTranslation_array, myTranslation;
		n_hits = practiceHandler.data_array[practiceHandler.currentWord].hits;
		orgTranslation_array = practiceHandler.data_array[practiceHandler.currentWord].translation.toLowerCase().latinize().split(/[ ;,.]+/); // split by comma, semicolon or space and 
		myTranslation = $('#translation').text().toLowerCase().latinize().split(/[ ;,.]+/)[0]; // take only the first word

		console.log('validation for entered  word "'+myTranslation+'" started...');
		if ($.inArray(myTranslation, orgTranslation_array) >= 0){ // is myTranslation in the array (returns -1 if not)
			console.log('Correct!! Word found on place: ' + $.inArray(myTranslation, orgTranslation_array));
			practiceHandler.updateDb(1);
		}else{
			console.log('Wrong!');
			practiceHandler.updateDb((n_hits - 1) >= 0 ? -1 : 0);	// avoid going to negative values
		}
		$('#translation').text('');
		practiceHandler.updateCurrentWord();
		practiceHandler.insert();
	},
	updateDb: function(hit){
		chrome.extension.getBackgroundPage().db.tx({name: 'validation_update', id: practiceHandler.data_array[practiceHandler.currentWord].id, validation: hit}, []);
	},
	updateCurrentWord: function(){
		practiceHandler.currentWord = Math.min(practiceHandler.data_array.length, practiceHandler.currentWord + 1);
	}

}
// Convert strings with accents http://goo.gl/LXM55
var Latinise={};Latinise.latin_map = {
'á': 'a','ă': 'a','ắ': 'a','ặ': 'a','ằ': 'a','ẳ': 'a','ẵ': 'a','ǎ': 'a','â': 'a','ấ': 'a','ậ': 'a','ầ': 'a','ẩ': 'a','ẫ': 'a','ä': 'a','ǟ': 'a','ȧ': 'a','ǡ': 'a','ạ': 'a','ȁ': 'a',
'à': 'a','ả': 'a','ȃ': 'a','ā': 'a','ą': 'a','ᶏ': 'a','ẚ': 'a','å': 'a','ǻ': 'a','ḁ': 'a','ⱥ': 'a','ã': 'a','ꜳ': 'aa','æ': 'ae','ǽ': 'ae','ǣ': 'ae','ꜵ': 'ao','ꜷ': 'au','ꜹ': 'av',
'ꜻ': 'av','ꜽ': 'ay','ḃ': 'b','ḅ': 'b','ɓ': 'b','ḇ': 'b','ᵬ': 'b','ᶀ': 'b','ƀ': 'b','ƃ': 'b','ɵ': 'o','ć': 'c','č': 'c','ç': 'c','ḉ': 'c','ĉ': 'c','ɕ': 'c','ċ': 'c','ƈ': 'c','ȼ': 'c',
'ď': 'd','ḑ': 'd','ḓ': 'd','ȡ': 'd','ḋ': 'd','ḍ': 'd','ɗ': 'd','ᶑ': 'd','ḏ': 'd','ᵭ': 'd','ᶁ': 'd','đ': 'd','ɖ': 'd','ƌ': 'd','ı': 'i','ȷ': 'j','ɟ': 'j','ʄ': 'j','ǳ': 'dz','ǆ': 'dz',
'é': 'e','ĕ': 'e','ě': 'e','ȩ': 'e','ḝ': 'e','ê': 'e','ế': 'e','ệ': 'e','ề': 'e','ể': 'e','ễ': 'e','ḙ': 'e','ë': 'e','ė': 'e','ẹ': 'e','ȅ': 'e','è': 'e','ẻ': 'e','ȇ': 'e','ē': 'e',
'ḗ': 'e','ḕ': 'e','ⱸ': 'e','ę': 'e','ᶒ': 'e','ɇ': 'e','ẽ': 'e','ḛ': 'e','ꝫ': 'et','ḟ': 'f','ƒ': 'f','ᵮ': 'f','ᶂ': 'f','ǵ': 'g','ğ': 'g','ǧ': 'g','ģ': 'g','ĝ': 'g','ġ': 'g','ɠ': 'g',
'ḡ': 'g','ᶃ': 'g','ǥ': 'g','ḫ': 'h','ȟ': 'h','ḩ': 'h','ĥ': 'h','ⱨ': 'h','ḧ': 'h','ḣ': 'h','ḥ': 'h','ɦ': 'h','ẖ': 'h','ħ': 'h','ƕ': 'hv','í': 'i','ĭ': 'i','ǐ': 'i','î': 'i','ï': 'i',
'ḯ': 'i','ị': 'i','ȉ': 'i','ì': 'i','ỉ': 'i','ȋ': 'i','ī': 'i','į': 'i','ᶖ': 'i','ɨ': 'i','ĩ': 'i','ḭ': 'i','ꝺ': 'd','ꝼ': 'f','ᵹ': 'g','ꞃ': 'r','ꞅ': 's','ꞇ': 't','ꝭ': 'is','ǰ': 'j',
'ĵ': 'j','ʝ': 'j','ɉ': 'j','ḱ': 'k','ǩ': 'k','ķ': 'k','ⱪ': 'k','ꝃ': 'k','ḳ': 'k','ƙ': 'k','ḵ': 'k','ᶄ': 'k','ꝁ': 'k','ꝅ': 'k','ĺ': 'l','ƚ': 'l','ɬ': 'l','ľ': 'l','ļ': 'l','ḽ': 'l',
'ȴ': 'l','ḷ': 'l','ḹ': 'l','ⱡ': 'l','ꝉ': 'l','ḻ': 'l','ŀ': 'l','ɫ': 'l','ᶅ': 'l','ɭ': 'l','ł': 'l','ǉ': 'lj','ſ': 's','ẜ': 's','ẛ': 's','ẝ': 's','ḿ': 'm','ṁ': 'm','ṃ': 'm','ɱ': 'm',
'ᵯ': 'm','ᶆ': 'm','ń': 'n','ň': 'n','ņ': 'n','ṋ': 'n','ȵ': 'n','ṅ': 'n','ṇ': 'n','ǹ': 'n','ɲ': 'n','ṉ': 'n','ƞ': 'n','ᵰ': 'n','ᶇ': 'n','ɳ': 'n','ñ': 'n','ǌ': 'nj','ó': 'o','ŏ': 'o',
'ǒ': 'o','ô': 'o','ố': 'o','ộ': 'o','ồ': 'o','ổ': 'o','ỗ': 'o','ö': 'o','ȫ': 'o','ȯ': 'o','ȱ': 'o','ọ': 'o','ő': 'o','ȍ': 'o','ò': 'o','ỏ': 'o','ơ': 'o','ớ': 'o','ợ': 'o','ờ': 'o',
'ở': 'o','ỡ': 'o','ȏ': 'o','ꝋ': 'o','ꝍ': 'o','ⱺ': 'o','ō': 'o','ṓ': 'o','ṑ': 'o','ǫ': 'o','ǭ': 'o','ø': 'o','ǿ': 'o','õ': 'o','ṍ': 'o','ṏ': 'o','ȭ': 'o','ƣ': 'oi','ꝏ': 'oo','ɛ': 'e',
'ᶓ': 'e','ɔ': 'o','ᶗ': 'o','ȣ': 'ou','ṕ': 'p','ṗ': 'p','ꝓ': 'p','ƥ': 'p','ᵱ': 'p','ᶈ': 'p','ꝕ': 'p','ᵽ': 'p','ꝑ': 'p','ꝙ': 'q','ʠ': 'q','ɋ': 'q','ꝗ': 'q','ŕ': 'r','ř': 'r','ŗ': 'r',
'ṙ': 'r','ṛ': 'r','ṝ': 'r','ȑ': 'r','ɾ': 'r','ᵳ': 'r','ȓ': 'r','ṟ': 'r','ɼ': 'r','ᵲ': 'r','ᶉ': 'r','ɍ': 'r','ɽ': 'r','ↄ': 'c','ꜿ': 'c','ɘ': 'e','ɿ': 'r','ś': 's','ṥ': 's','š': 's',
'ṧ': 's','ş': 's','ŝ': 's','ș': 's','ṡ': 's','ṣ': 's','ṩ': 's','ʂ': 's','ᵴ': 's','ᶊ': 's','ȿ': 's','ß': 'ss','ɡ': 'g','ᴑ': 'o','ᴓ': 'o','ᴝ': 'u','ť': 't','ţ': 't','ṱ': 't','ț': 't',
'ȶ': 't','ẗ': 't','ⱦ': 't','ṫ': 't','ṭ': 't','ƭ': 't','ṯ': 't','ᵵ': 't','ƫ': 't','ʈ': 't','ŧ': 't','ᵺ': 'th','ɐ': 'a','ᴂ': 'ae','ǝ': 'e','ᵷ': 'g','ɥ': 'h','ʮ': 'h','ʯ': 'h','ᴉ': 'i',
'ʞ': 'k','ꞁ': 'l','ɯ': 'm','ɰ': 'm','ᴔ': 'oe','ɹ': 'r','ɻ': 'r','ɺ': 'r','ⱹ': 'r','ʇ': 't','ʌ': 'v','ʍ': 'w','ʎ': 'y','ꜩ': 'tz','ú': 'u','ŭ': 'u','ǔ': 'u','û': 'u','ṷ': 'u','ü': 'u',
'ǘ': 'u','ǚ': 'u','ǜ': 'u','ǖ': 'u','ṳ': 'u','ụ': 'u','ű': 'u','ȕ': 'u','ù': 'u','ủ': 'u','ư': 'u','ứ': 'u','ự': 'u','ừ': 'u','ử': 'u','ữ': 'u','ȗ': 'u','ū': 'u','ṻ': 'u','ų': 'u',
'ᶙ': 'u','ů': 'u','ũ': 'u','ṹ': 'u','ṵ': 'u','ᵫ': 'ue','ꝸ': 'um','ⱴ': 'v','ꝟ': 'v','ṿ': 'v','ʋ': 'v','ᶌ': 'v','ⱱ': 'v','ṽ': 'v','ꝡ': 'vy','ẃ': 'w','ŵ': 'w','ẅ': 'w','ẇ': 'w','ẉ': 'w',
'ẁ': 'w','ⱳ': 'w','ẘ': 'w','ẍ': 'x','ẋ': 'x','ᶍ': 'x','ý': 'y','ŷ': 'y','ÿ': 'y','ẏ': 'y','ỵ': 'y','ỳ': 'y','ƴ': 'y','ỷ': 'y','ỿ': 'y','ȳ': 'y','ẙ': 'y','ɏ': 'y','ỹ': 'y','ź': 'z',
'ž': 'z','ẑ': 'z','ʑ': 'z','ⱬ': 'z','ż': 'z','ẓ': 'z','ȥ': 'z','ẕ': 'z','ᵶ': 'z','ᶎ': 'z','ʐ': 'z','ƶ': 'z','ɀ': 'z','ﬀ': 'ff','ﬃ': 'ffi','ﬄ': 'ffl','ﬁ': 'fi','ﬂ': 'fl','ĳ': 'ij',
'œ': 'oe','ﬆ': 'st','ₐ': 'a','ₑ': 'e','ᵢ': 'i','ⱼ': 'j','ₒ': 'o','ᵣ': 'r','ᵤ': 'u','ᵥ': 'v','ₓ': 'x'};
String.prototype.latinise=function(){return this.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return Latinise.latin_map[a]||a})};
String.prototype.latinize=String.prototype.latinise;
String.prototype.isLatin=function(){return this==this.latinise()}