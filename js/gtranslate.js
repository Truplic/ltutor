 var googleTranslate = {
	translationRequest: function(langFrom, langTo, text, onSucessFn, onErrorFn) {
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
				onSucessFn(JSON.parse(xhr.responseText));
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

	}

}