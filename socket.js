const { Server } = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = new Server(server);
    console.log('socket server initialized');
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  },
};
