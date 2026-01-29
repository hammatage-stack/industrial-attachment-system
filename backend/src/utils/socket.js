let io = null;
module.exports = {
  init: (server) => {
    const socketIO = require('socket.io');
    io = socketIO(server, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
      socket.on('join', (room) => {
        socket.join(room);
      });
      socket.on('disconnect', () => {});
    });
    return io;
  },
  getIO: () => io
};
