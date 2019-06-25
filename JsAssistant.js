
class JsAssistant {
	static get isCompatible() {
		return !!(window.SpeechRecognition || window.webkitSpeechRecognition ||
			window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition);
	}
	static get Recognition() {
		return window.SpeechRecognition || window.webkitSpeechRecognition ||
			window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition || null;
	}
	static get Synthesis() {
		return window.speechSynthesis || null;
	}
	get SpeakerKey() {
		return '290b35ce577849d7a28dbc251b6ee081';
	}

	constructor() {
		this.recognition = null;
		this.lastStartedAt = null;
		this.commands = new Map();
		this.debug = false;
		if(!JsAssistant.Synthesis) console.warn("JsAssistant synthesis is not compatible with your navigator");
		if(!JsAssistant.Recognition) throw new ErrorEvent("JsAssistant recognition is not compatible with your navigator !");
	}

	stop() {
		if (this.recognition && this.recognition.abort) {
			this.recognition.abort();
		}
		else throw new ErrorEvent("stop method is not implemented !");
	}

	addCommand(sentence, callback) {
		this.commands.set(sentence, callback);
		return this;
	}
	addCommands(...commands) {
		commands.forEach(command => {
			this.commands.set(command.sentence, command.callback);
		});
		return this;
	}
	addCommandGroup(sentences, callback) {
		sentences.forEach(sentence => {
			this.commands.set(sentence, callback);
		})
	}

	startVocalRecognition() {
		this.lastStartedAt = new Date().getTime();
		this.recognition.start();
	}

	start(options= { continuous: true, lang: 'fr-FR' }) {
		this.recognition = new JsAssistant.Recognition();
		for(let prop in options) {
			if(prop === 'debug') {
				this.debug = options.debug;
			}
			else {
				this.recognition[prop] = options[prop];
			}
		}
		if(!options.continuous) {
			this.recognition.continuous = true;
		}
		if(!options.lang) {
			this.recognition.lang = 'fr-FR';
		}
		if(!options.onstart) {
			this.recognition.onstart = function() {
				console.log('start voice recognition');
			}
		}
		if(!options.onend) {
			this.recognition.onend = () => {
				console.log('end voice recognition');
				let timeSinceLastStart = new Date().getTime() - this.lastStartedAt;
				timeSinceLastStart < 1000 ?
					setTimeout(this.startVocalRecognition, 1000 - timeSinceLastStart) : this.startVocalRecognition();
			}
		}
		this.recognition.onresult = event => {
			for (let i = event.resultIndex; i < event.results.length; ++i) {
				let texteReconnu = event.results[i][0].transcript;
				for(let command of this.commands.entries()) {
					let sentence, callback;
					[sentence, callback] = [...command];
					if(this.debug) {
						console.debug(sentence, texteReconnu);
					}
					if(typeof sentence === 'string') {
						if(sentence === texteReconnu)
							this.commands.get(sentence)(sentence);
					}
					else if(typeof sentence === 'object' && sentence instanceof RegExp) {
						if(texteReconnu.match(sentence)) {
							let matches = sentence.exec(texteReconnu);
							let complete_sentence = matches.shift();
							if(this.debug) {
								console.debug(matches, complete_sentence);
							}
							this.commands.get(sentence)(sentence, complete_sentence, ...matches);
						}
					}
				}
			}
		};
		this.startVocalRecognition();
	}

	say(text, options = {}) {
		// let final_options = {
		// 	key: this.SpeakerKey,
		// 	src: text,
		// 	hl: 'fr-fr',
		// 	r: 0.5,
		// 	c: 'mp3',
		// 	f: '44khz_16bit_stereo',
		// 	ssml: false
		// };
		// for(let option in options) {
		// 	option === 'lang' ? final_options.hl = options[option] : final_options[option] = options[option];
		// }
		function getVoice() {
			return new Promise(resolve => {
				let voices = window.speechSynthesis.getVoices();
				for(let i = 0; i < voices.length ; i++) {
					if(voices[i].lang === 'fr-FR' && !voices[i].default) {
						resolve(voices[i]);
						break;
					}
				}
			});
		}

		if(speechSynthesis !== undefined) {
			speechSynthesis.addEventListener('voiceschanged', () => {
				getVoice().then(voice => {
					console.log(voice);
					let msg = new SpeechSynthesisUtterance(text);
					msg.voice = voice;
					window.speechSynthesis.speak(msg)
				});
			});
		}
	}
}

window.JsAssistant = JsAssistant;

// // Initialisation de la reconnaissance vocale en fonction du navigateur
// // Pour l'instant, seul Google Chrome le supporte
// let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition ||
// 	window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;
//
// let recognition;
// let lastStartedAt;
//
// if (!SpeechRecognition) {
// 	console.log('Pas de reconnaissance vocale disponible');
// 	alert('Pas de reconnaissance vocale disponible');
// } else {
// 	// Arrêt de l'ensemble des instances déjà démarrées
// 	if (recognition && recognition.abort) {
// 		recognition.abort();
// 	}
//
// 	// Initialisation de la reconnaissance vocale
// 	recognition = new SpeechRecognition();
// 	// Reconnaissance en continue
// 	recognition.continuous = true;
// 	// Langue française
// 	recognition.lang = 'fr-FR';
//
// 	// Evènement de début de la reconnaissance vocale
// 	recognition.onstart = function() {
// 		console.log('Démarrage de la reconnaissance');
// 	};
//
// 	// Evènement de fin de la reconnaissance vocale
// 	// A la fin de la reconnaissance (timeout), il est nécessaire de la redémarrer pour avoir une reconnaissance en continu
// 	// Ce code a été repris de annyang
// 	recognition.onend = () => {
// 		console.log('Fin de la reconnaissance');
// 		let timeSinceLastStart = new Date().getTime()-lastStartedAt;
// 		timeSinceLastStart < 1000 ? setTimeout(demarrerReconnaissanceVocale, 1000 - timeSinceLastStart) : demarrerReconnaissanceVocale();
// 	};
//
// 	// Evènement de résultat de la reconnaissance vocale
// 	recognition.onresult = event => {
// 		for (let i = event.resultIndex; i < event.results.length; ++i) {
// 			let texteReconnu = event.results[i][0].transcript;
// 			console.log('Résultat = ' + texteReconnu);
// 			// Synthèse vocale de ce qui a été reconnu
// 			let u = new SpeechSynthesisUtterance();
// 			u.text = texteReconnu;
// 			u.lang = 'fr-FR';
// 			u.rate = 1.2;
// 			speechSynthesis.speak(u);
// 		}
// 	};
//
// 	// Démarrage de la reconnaissance vocale
// 	demarrerReconnaissanceVocale();
// }
//
// function demarrerReconnaissanceVocale() {
// 	// Démarrage de la reconnaissance vocale
// 	lastStartedAt = new Date().getTime();
// 	recognition.start();
// }