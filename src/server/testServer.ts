import net from 'net';
import { Server as IOServer } from 'socket.io';
import http from 'http';



// Create HTTP server for socket.io
const httpServer = http.createServer();
const io = new IOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

// Start socket.io server
io.on("connection", (socket) => {
  console.log("Web client connected");

  socket.on("disconnect", () => {
    console.log("Web client disconnected");
  });
});

// Start TCP server
const tcpServer = net.createServer((socket) => {
  console.log(`TCP connection from ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (data) => {
    const msg = data.toString();
    console.log(`Received: ${msg}`);

    // Emit to all connected web clients
    io.emit("data", { log: `TCP: ${msg}` });
    // Echo back to TCP client
    socket.write(`Echo: ${msg}`);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});



const TCP_PORT = 9000;
const SOCKET_PORT = 9001;

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP echo server on port ${TCP_PORT}`);
});

httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server on port ${SOCKET_PORT}`);
});




