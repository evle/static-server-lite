const Server = require("./core");

const server = new Server({
  onstart: () => console.log("custom start message")
});

server.start(3001);
