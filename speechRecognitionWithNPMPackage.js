let ctrl = new anycontrol();

ctrl.addCommand("previous page", () => {
    console.log('Go to previous page')
});

ctrl.addCommand("next page",  () => {
    console.log('Go to next page')
});

ctrl.addCommand("search", param => {
    console.log("Search for:", param);
});

ctrl.removeCommand("next page");

ctrl.start();

// ctrl.getCommand();

// ctrl.stop();

ctrl.debug(true);