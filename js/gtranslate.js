//window.addEventListener('load', , false);
$(function(){
     googleTranslate.audio.init();

});

var googleTranslate = { 
     translate: function(langFrom, langTo, text, fieldId, onSucessFn, onErrorFn) {
		var url, xhr;
		
		url = this.getUrl("translate", langFrom, langTo, text);
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
     example: function(langFrom, langTo, text, fieldId, onSucessFn, onErrorFn) {
          var url, xhr;
          
          url = this.getUrl("example", langFrom, langTo, text);
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
	getUrl: function(urlType, langFrom, langTo, text) {
		switch (urlType){
		case 'translate':
               return 'http://translate.google.com/translate_a/t?client=gtranslate&sl=%from%&tl=%to%&text=%text%'
                         .replace(/%from%/, langFrom)
                         .replace(/%to%/, langTo)
                         .replace(/%text%/, encodeURIComponent(text));
			//return 'http://translate.google.com/translate_a/t?client=gtranslate&sl=' + langFrom + '&tl=' + langTo + '&text=' + encodeURIComponent(text);
		break;
          case 'example':

               return 'http://translate.google.com/translate_a/ex?sl=%from%&tl=%to%&q=%text%&utrans=%text%'
                         .replace(/%from%/, langFrom)
                         .replace(/%to%/, langTo)
                         .replace(/%text%/, encodeURIComponent(text));
               //return 'http://translate.google.com/translate_a/t?client=gtranslate&sl=' + langFrom + '&tl=' + langTo + '&text=' + encodeURIComponent(text);
          break;
		case 'audio':
			//ex.: http://translate.google.com/translate_tts?tl=en&q=Welcome+to+our+fantastic+text+to+voice+demonstration
			//return 'http://translate.google.com/translate_tts?tl='+ langFrom +'&q='+ encodeURIComponent(text);
               //console.log(text );
               return 'http://translate.google.com/translate_tts?ie=UTF-8&q=%text%&tl=%lang%&total=%parts%&idx=0&textlen=%len%'
                         .replace(/%text%/, encodeURIComponent(text) ) 
                         .replace(/%lang%/, langFrom)
                         .replace(/%parts%/, text.split(' ').length)
                         .replace(/%len%/, text.length);
		break;
		default:
			console.log('Warning! Not recognized google request type');
		}

	},
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
     audio: {
          context: '',
          init: function(){
            try {
              googleTranslate.audio.context = new webkitAudioContext();
            }
            catch(e) {
              alert('Web Audio API is not supported in this browser');
            }
          },
          play: function(lang, text, fieldId) {
               var url, xhr;
               
               url = googleTranslate.getUrl("audio", lang, [], text );
               xhr = new XMLHttpRequest();
               xhr.open("GET", url, true);
               xhr.responseType = 'arraybuffer';

               xhr.onreadystatechange = function() {
                 if (xhr.readyState == 4) {
                    // JSON.parse does not evaluate the attacker's scripts.
                    if (xhr.response != null){
                         if(xhr.response.byteLength){
                              googleTranslate.audio.context.decodeAudioData(xhr.response, 
                                   function(buffer) {  // callback function
                                        googleTranslate.audio.output(buffer);
                                   }, 
                                   function(e){ // error function
                                        console.log('[Error] DecodeAudioData: ' + e)
                                   }
                              );
                         }
                    }
                 }
               }
               xhr.send();
          },
          output: function(buffer) {
               var source = googleTranslate.audio.context.createBufferSource(); // creates a sound source
               source.buffer = buffer;                    // tell the source which sound to play
               source.connect(googleTranslate.audio.context.destination);       // connect the source to the googleTranslate.audio.context's destination (the speakers)
               source.noteOn(0);                          // play the source now
          },
          isPlayable: function(lang){
               if (navigator.onLine && googleTranslate.getAttrValue(lang, 'hasAudio') && lang.length){
                    return true;
               } else {
                    return false;
               }
          }

     }, // End of Audio class
	languageList: [
     { name: 'Auto', 				abbr: 'auto', 	hasAudio: false},
     { name: 'Afrikaans', 			abbr: 'af', 	hasAudio: true	},
     { name: 'Albanian', 			abbr: 'sq', 	hasAudio: true	},
     { name: 'Arabic', 				abbr: 'ar', 	hasAudio: true	},
     { name: 'Armenian', 			abbr: 'hy', 	hasAudio: true	},
     { name: 'Azerbaijani', 		     abbr: 'az', 	hasAudio: false},
     { name: 'Basque', 				abbr: 'eu', 	hasAudio: false},
     { name: 'Belarusian', 			abbr: 'be', 	hasAudio: false},
     { name: 'Bengali', 			     abbr: 'bn', 	hasAudio: false},
     { name: 'Bulgarian', 	   		abbr: 'bg', 	hasAudio: false},
     { name: 'Catalan',                 abbr: 'ca', 	hasAudio: true	},
     { name: 'Chinese Simplified', 	abbr: 'zh-CN', hasAudio: true	},
     { name: 'Chinese Traditional',     abbr: 'zh-TW', hasAudio: true	},
     { name: 'Croatian', 			abbr: 'hr', 	hasAudio: true	},
     { name: 'Czech', 				abbr: 'cs', 	hasAudio: true	},
     { name: 'Danish', 				abbr: 'da', 	hasAudio: true	},
     { name: 'Dutch', 				abbr: 'nl', 	hasAudio: true	},
     { name: 'English', 			     abbr: 'en', 	hasAudio: true	},
     { name: 'Esperanto', 			abbr: 'eo', 	hasAudio: true	},
     { name: 'Estonian', 			abbr: 'et', 	hasAudio: false},
     { name: 'Filipino', 			abbr: 'tl', 	hasAudio: false},
     { name: 'Finnish', 			     abbr: 'fi', 	hasAudio: true	},
     { name: 'French', 				abbr: 'fr', 	hasAudio: true	},
     { name: 'Galician', 			abbr: 'gl', 	hasAudio: false},
     { name: 'Georgian', 			abbr: 'ka', 	hasAudio: false},
     { name: 'German', 				abbr: 'de', 	hasAudio: true	},
     { name: 'Greek', 				abbr: 'el', 	hasAudio: true	},
     { name: 'Gujarati', 			abbr: 'gu', 	hasAudio: false},
     { name: 'Haitian Creole', 		abbr: 'ht', 	hasAudio: true	},
     { name: 'Hebrew', 				abbr: 'iw', 	hasAudio: false},
     { name: 'Hindi', 				abbr: 'hi', 	hasAudio: true	},
     { name: 'Hungarian', 			abbr: 'hu', 	hasAudio: true	},
     { name: 'Icelandic', 			abbr: 'is', 	hasAudio: true	},
     { name: 'Indonesian', 			abbr: 'id', 	hasAudio: true	},
     { name: 'Irish', 				abbr: 'ga', 	hasAudio: false},
     { name: 'Italian', 			     abbr: 'it', 	hasAudio: true	},
     { name: 'Japanese', 			abbr: 'ja', 	hasAudio: true	},
     { name: 'Kannada', 			     abbr: 'kn', 	hasAudio: false},
     { name: 'Korean', 				abbr: 'ko', 	hasAudio: true	},
     { name: 'Lao', 				abbr: 'lo', 	hasAudio: false},	 
     { name: 'Latin', 				abbr: 'la', 	hasAudio: true	},
     { name: 'Latvian', 			     abbr: 'lv', 	hasAudio: true	},
     { name: 'Lithuanian', 			abbr: 'lt', 	hasAudio: false},
     { name: 'Macedonian', 			abbr: 'mk', 	hasAudio: true	},
     { name: 'Malay', 				abbr: 'ms', 	hasAudio: false},
     { name: 'Maltese', 			     abbr: 'mt', 	hasAudio: false},
     { name: 'Norwegian', 			abbr: 'no', 	hasAudio: true	},
     { name: 'Persian',                 abbr: 'fa', 	hasAudio: false},
     { name: 'Polish', 				abbr: 'pl', 	hasAudio: true	},
     { name: 'Portuguese', 			abbr: 'pt', 	hasAudio: true	},
     { name: 'Romanian', 			abbr: 'ro', 	hasAudio: true	},
     { name: 'Russian',                 abbr: 'ru', 	hasAudio: true	},
     { name: 'Serbian',                 abbr: 'sr', 	hasAudio: true	},
     { name: 'Slovak', 				abbr: 'sk', 	hasAudio: true	},
     { name: 'Slovenian', 			abbr: 'sl', 	hasAudio: false},
     { name: 'Spanish',                 abbr: 'es', 	hasAudio: true	},
     { name: 'Swahili',                 abbr: 'sw', 	hasAudio: true	},
     { name: 'Swedish',                 abbr: 'sv', 	hasAudio: true	},
     { name: 'Tamil', 				abbr: 'ta', 	hasAudio: true	},
     { name: 'Telugu', 				abbr: 'te', 	hasAudio: false},
     { name: 'Thai', 				abbr: 'th', 	hasAudio: true	},
     { name: 'Turkish',                 abbr: 'tr', 	hasAudio: true	},
     { name: 'Ukrainian', 			abbr: 'uk', 	hasAudio: false},
     { name: 'Urdu', 				abbr: 'ur', 	hasAudio: false},
     { name: 'Vietnamese', 			abbr: 'vi', 	hasAudio: true	},
     { name: 'Welsh', 				abbr: 'cy', 	hasAudio: true	},
     { name: 'Yiddish',                 abbr: 'yi', 	hasAudio: false}
    ]

}