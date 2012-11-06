 var googleTranslate = { 
	translationRequest: function(langFrom, langTo, text, fieldId, onSucessFn, onErrorFn) {
		var url, xhr;
		
		url = this.getGoogleUrl("translate", langFrom, langTo, text);
		xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
			// JSON.parse does not evaluate the attacker's scripts.
			if(xhr.responseText.length){
				// var resp = JSON.parse(xhr.responseText);
				// console.log(resp);
				onSucessFn(JSON.parse(xhr.responseText), fieldId);
			}
		  }
		}
		xhr.send();
	},
	getGoogleUrl: function(urlType, langFrom, langTo, text) {
		switch (urlType){
		case 'translate':
			return 'http://translate.google.com/translate_a/t?client=gtranslate&sl=' + langFrom + '&tl=' + langTo + '&text=' + encodeURIComponent(text);
		break;
		case 'audio':
			//ex.: http://translate.google.com/translate_tts?tl=en&q=Welcome+to+our+fantastic+text+to+voice+demonstration
			return 'http://translate.google.com/translate_tts?tl='+ langFrom +'&q='+ encodeURIComponent(text);
		break;
		default:
			console.log('Warning! Not recognized google request type');
		}

	},
	languageList: [
     { name: 'Auto', 				abbr: 'auto', 	hasAudio: false	},
     { name: 'Afrikaans', 			abbr: 'af', 	hasAudio: true	},
     { name: 'Albanian', 			abbr: 'sq', 	hasAudio: true	},
     { name: 'Arabic', 				abbr: 'ar', 	hasAudio: true	},
     { name: 'Armenian', 			abbr: 'hy', 	hasAudio: true	},
     { name: 'Azerbaijani', 		abbr: 'az', 	hasAudio: false	},
     { name: 'Basque', 				abbr: 'eu', 	hasAudio: false	},
     { name: 'Belarusian', 			abbr: 'be', 	hasAudio: false	},
     { name: 'Bengali', 			abbr: 'bn', 	hasAudio: false	},
     { name: 'Bulgarian', 			abbr: 'bg', 	hasAudio: false	},
     { name: 'Catalan', 			abbr: 'ca', 	hasAudio: true	},
     { name: 'Chinese Simplified', 	abbr: 'zh-CN', 	hasAudio: true	},
     { name: 'Chinese Traditional', abbr: 'zh-TW', 	hasAudio: true	},
     { name: 'Croatian', 			abbr: 'hr', 	hasAudio: true	},
     { name: 'Czech', 				abbr: 'cs', 	hasAudio: true	},
     { name: 'Danish', 				abbr: 'da', 	hasAudio: true	},
     { name: 'Dutch', 				abbr: 'nl', 	hasAudio: true	},
     { name: 'English', 			abbr: 'en', 	hasAudio: true	},
     { name: 'Esperanto', 			abbr: 'eo', 	hasAudio: true	},
     { name: 'Estonian', 			abbr: 'et', 	hasAudio: false	},
     { name: 'Filipino', 			abbr: 'tl', 	hasAudio: false	},
     { name: 'Finnish', 			abbr: 'fi', 	hasAudio: true	},
     { name: 'French', 				abbr: 'fr', 	hasAudio: true	},
     { name: 'Galician', 			abbr: 'gl', 	hasAudio: false	},
     { name: 'Georgian', 			abbr: 'ka', 	hasAudio: false	},
     { name: 'German', 				abbr: 'de', 	hasAudio: true	},
     { name: 'Greek', 				abbr: 'el', 	hasAudio: true	},
     { name: 'Gujarati', 			abbr: 'gu', 	hasAudio: false	},
     { name: 'Haitian Creole', 		abbr: 'ht', 	hasAudio: true	},
     { name: 'Hebrew', 				abbr: 'iw', 	hasAudio: false	},
     { name: 'Hindi', 				abbr: 'hi', 	hasAudio: true	},
     { name: 'Hungarian', 			abbr: 'hu', 	hasAudio: true	},
     { name: 'Icelandic', 			abbr: 'is', 	hasAudio: true	},
     { name: 'Indonesian', 			abbr: 'id', 	hasAudio: true	},
     { name: 'Irish', 				abbr: 'ga', 	hasAudio: false	},
     { name: 'Italian', 			abbr: 'it', 	hasAudio: true	},
     { name: 'Japanese', 			abbr: 'ja', 	hasAudio: true	},
     { name: 'Kannada', 			abbr: 'kn', 	hasAudio: false	},
     { name: 'Korean', 				abbr: 'ko', 	hasAudio: true	},
     { name: 'Lao', 				abbr: 'lo', 	hasAudio: false	},	 
     { name: 'Latin', 				abbr: 'la', 	hasAudio: true	},
     { name: 'Latvian', 			abbr: 'lv', 	hasAudio: true	},
     { name: 'Lithuanian', 			abbr: 'lt', 	hasAudio: false	},
     { name: 'Macedonian', 			abbr: 'mk', 	hasAudio: true	},
     { name: 'Malay', 				abbr: 'ms', 	hasAudio: false	},
     { name: 'Maltese', 			abbr: 'mt', 	hasAudio: false	},
     { name: 'Norwegian', 			abbr: 'no', 	hasAudio: true	},
     { name: 'Persian', 			abbr: 'fa', 	hasAudio: false	},
     { name: 'Polish', 				abbr: 'pl', 	hasAudio: true	},
     { name: 'Portuguese', 			abbr: 'pt', 	hasAudio: true	},
     { name: 'Romanian', 			abbr: 'ro', 	hasAudio: true	},
     { name: 'Russian', 			abbr: 'ru', 	hasAudio: true	},
     { name: 'Serbian', 			abbr: 'sr', 	hasAudio: true	},
     { name: 'Slovak', 				abbr: 'sk', 	hasAudio: true	},
     { name: 'Slovenian', 			abbr: 'sl', 	hasAudio: false	},
     { name: 'Spanish', 			abbr: 'es', 	hasAudio: true	},
     { name: 'Swahili', 			abbr: 'sw', 	hasAudio: true	},
     { name: 'Swedish', 			abbr: 'sv', 	hasAudio: true	},
     { name: 'Tamil', 				abbr: 'ta', 	hasAudio: true	},
     { name: 'Telugu', 				abbr: 'te', 	hasAudio: false	},
     { name: 'Thai', 				abbr: 'th', 	hasAudio: true	},
     { name: 'Turkish', 			abbr: 'tr', 	hasAudio: true	},
     { name: 'Ukrainian', 			abbr: 'uk', 	hasAudio: false	},
     { name: 'Urdu', 				abbr: 'ur', 	hasAudio: false	},
     { name: 'Vietnamese', 			abbr: 'vi', 	hasAudio: true	},
     { name: 'Welsh', 				abbr: 'cy', 	hasAudio: true	},
     { name: 'Yiddish', 			abbr: 'yi', 	hasAudio: false	}
    ],
	getAttrValue: function(lanAbbr, attr){
		var attrValue;
		$.grep( googleTranslate.languageList, function(n, i){
			if (n.abbr.toLowerCase() === lanAbbr.toLowerCase()){
				attrValue = n[attr];
				return false;  // to exit the loop
			}
		 });
		return attrValue;
	},
	playWord: function(word){
		"use strict"
		if (googleTranslate.isAudioPlayable()) {
			$('#ltPlayer').children().remove();
			$('#ltPlayer').append(
				'<audio controls="controls">'
				+	'<source src='+ googleTranslate.getGoogleUrl("audio", getBg().ls.get('activeTable').iLearn, [], word ) +' type="audio/mpeg">'
				+	'Your browser does not support the audio element.'
				+'</audio>'	);
			$('audio').trigger('play');
		}
	},
	isAudioPlayable: function(){
		if (getBg().util.isOnline() && googleTranslate.getAttrValue(getBg().ls.get('activeTable').iLearn, 'hasAudio')){
			return true;
		} else {
			return false;
		}
	}

}