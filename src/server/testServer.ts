import net from 'net';

const server = net.createServer((socket) => {
  console.log(`📡 New connection from ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (data) => {
    console.log(`📨 Received: ${data.toString()}`);
  });

  socket.on('end', () => {
    console.log('🔌 Client disconnected');
  });

  socket.on('error', (err) => {
    console.error(`❌ Socket error: ${err.message}`);
  });
});

const PORT = 9000;
server.listen(PORT, () => {
  console.log(`✅ Echo server listening on port ${PORT}`);
});