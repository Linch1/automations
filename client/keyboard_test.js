const robot = require('robotjs');

// Pauză de 2 secunde înainte de începerea simulării
setTimeout(() => {
  // Scrie un text
  robot.typeString("Hello from Node.js!");

  // Simulează Enter
  robot.keyTap("enter");
}, 2000);
