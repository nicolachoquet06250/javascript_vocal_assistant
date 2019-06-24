window.onload = () => {
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if ('SpeechRecognition' in window && window.SpeechRecognition !== undefined) {
        // speech recognition API supported
        let finalTranscript = '';
        let recognition = new window.SpeechRecognition();

        recognition.interimResults = true;
        recognition.maxAlternatives = 10;
        recognition.continuous = true;

        recognition.onresult = event => {
            let interimTranscript = '';
            for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
                let transcript = event.results[i][0].transcript;
                event.results[i].isFinal ?
                    finalTranscript += transcript : interimTranscript += transcript;
            }
            document.querySelector('body').innerHTML =
                `${finalTranscript} <i style="color:#ddd;">${interimTranscript}</i>`;
        };

        recognition.start();
    } else {
        // speech recognition API not supported
        document.querySelector('body').innerHTML =
            `<b style="color: red;">La reconnaissence vocale n'est pas supportée par votre nacigateur.</b>`;
    }
};