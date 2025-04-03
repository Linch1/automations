const Fastify = require('fastify');
const cors = require('@fastify/cors');
const robot = require('robotjs');
const {execSync} = require('child_process')
const {default: clipboardy} = require("clipboardy");
const PORT = 6002;

const fastify = Fastify();
fastify.register(cors, {
  origin: '*', // Customize as needed
});

/*
function moveAndClick(x, y) {
    const current = robot.getMousePos();
    const steps = 50;
    const delay = Math.floor(Math.random() * 10) + 5; // Velocità variabile tra 5 e 15 ms
    const dx = (x - current.x) / steps;
    const dy = (y - current.y) / steps;
  
    for (let i = 0; i <= steps; i++) {
      robot.moveMouse(current.x + dx * i, current.y + dy * i);
      robot.setMouseDelay(delay);
    }
  
    robot.mouseToggle("down");
    robot.mouseToggle("up");
}*/
fastify.get('/click', async (request, reply) => {
  let {x,y} = request.query;
  console.log(`clicking x=${x} & y=${y}`)
  execSync(`xdotool mousemove ${x} ${y}`)
  execSync(`xdotool click 1`)
  //moveAndClick(x,y);
  return {status: true};
});

fastify.post('/type', async (request, reply) => {
    let {text} = request.body;
    
    clipboardy.writeSync(text);
    await new Promise(resolve => setTimeout(resolve, 300));
    robot.keyTap("v", "control");
    return {status: true};
});

// Start server
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
