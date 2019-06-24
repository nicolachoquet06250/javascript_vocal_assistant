const writeErrorMessage = (elem_id, message) =>
    document.querySelector(`#${elem_id}`).innerHTML = `<b style="color: red;">${message}</b>`;

const Jarvis = new Artyom();

if (Jarvis.speechSupported()) {
    Jarvis.say(
        "Hello World !", {
            onStart: () => console.log("Talking ..."),
            onEnd: () => console.log("I said all that i knew")
        });
}
else writeErrorMessage(
    'SpeechMessage',
    `La synthèse vocale n'est pas supportée par votre navigateur`
);

if (Jarvis.recognizingSupported()) {
    Jarvis.addCommands([
        {
            indexes: ['Hello', 'Hi', 'is someone there'],
            action: i => {
                Jarvis.say("Hello, it's me");
            }
        },
        {
            indexes: ['Repeat after me *'],
            smart: true,
            action: (i, wildcard) => Jarvis.say(`You've said : ${wildcard}`)
        },
        // The smart commands support regular expressions
        {
            indexes: [/Good Morning/i],
            smart: true,
            action: (i, wildcard) => Jarvis.say(`You've said : ${wildcard}`)
        },
        {
            indexes: ['shut down yourself'],
            action: (i, wildcard) => Jarvis.fatality().then(() => console.log("Artyom succesfully stopped"))
        },
    ]);

    // Jarvis.simulateInstruction("Hello");

    Jarvis.initialize({
        lang: "fr-FR", // Français
        continuous: false, // Listen forever
        soundex: true,// Use the soundex algorithm to increase accuracy
        debug: true, // Show messages in the console
        executionKeyword: "and do it now",
        listen: false, // Start to listen commands !
        // If providen, you can only trigger a command if you say its name
        // e.g to trigger Good Morning, you need to say "Jarvis Good Morning"
        name: "Jarvis"
    }).then(() => console.log("Artyom has been succesfully initialized"))
        .catch((err) => console.error("Artyom couldn't be initialized: ", err));
} else writeErrorMessage(
    'RecognizingMessage',
    `La reconnaissence vocale n'est pas supportée par votre navigateur.`
);