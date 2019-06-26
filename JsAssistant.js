
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

	startVocalRecognition(options = {}) {
		this.lastStartedAt = new Date().getTime();
		Object.keys(options).length !== 0 ? this.recognition.start(options) : this.recognition.start();
		return true;
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
		commands.forEach(command => this.addCommand(command['sentence'], command['callback']));
		return this;
	}
	addCommandGroup(sentences, callback) {
		sentences.forEach(sentence => {
			let _callback = typeof sentence === 'object' ? sentence['callback'] : callback,
				_sentence = typeof sentence === 'object' ? sentence['sentence'] : sentence;
			this.commands.set(_sentence, _callback);
		});
		return this;
	}

	start(options = { continuous: true, lang: 'fr-FR' }) {
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
					setTimeout(() => this.startVocalRecognition(), 1000 - timeSinceLastStart) : () => this.startVocalRecognition();
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
		this.startVocalRecognition(options);
	}

	say(text, options = {}) {
		let getVoice = () => {
			return new Promise(resolve => {
				let voices = JsAssistant.Synthesis.getVoices();
				for(let i = 0; i < voices.length ; i++) {
					if(voices[i].lang === 'fr-FR' && !voices[i].default) {
						resolve(voices[i]);
						break;
					}
				}
			});
		};

		if(speechSynthesis !== undefined) {
			speechSynthesis.addEventListener('voiceschanged', () => {
				getVoice().then(voice => {
					let msg = new SpeechSynthesisUtterance(text);
					msg.voice = voice;
					JsAssistant.Synthesis.speak(msg)
				});
			});
		}
	}
}

window.JsAssistant = JsAssistant;