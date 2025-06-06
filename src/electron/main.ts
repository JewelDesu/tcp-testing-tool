import  { app, BrowserWindow, ipcMain, Tray } from 'electron';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js'
import { getStaticData } from './resources.js';
import { getAssetPath, getPreloadPath, getUIPath } from './pathResolve.js';
import path from 'path';
import { createMenu } from './menu.js';
import net from 'net';
import { Server as IOServer } from 'socket.io';
import http from 'http';

let testServer: net.Server | null = null;
let httpServer: http.Server | null = null;


app.on("ready", () => {
  const mainWindow = new BrowserWindow({
      webPreferences:{
          preload: getPreloadPath(),
      },
      //frame: false,
      height: 620,
      width:718,
  });
  if(isDev()){
      mainWindow.loadURL('http://localhost:5123');
  } else {
      mainWindow.loadFile(getUIPath());
  }
  
  ipcMainHandle("getStaticData", () => {
      return getStaticData();
  })

  ipcMainOn('changeFrameAction', (payload) => {
    switch (payload) {
      case 'CLOSE':
        mainWindow.close();
        app.quit();
        break;
      case 'MAXIMIZE':
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
        break;
      case 'MINIMIZE':
        mainWindow.minimize();
        break;
    }
  });

  ipcMainOn('resizeWindow', (payload) => {
    switch (payload) {
      case 'smaller':
        mainWindow.setSize(718, 620);
        break;
      case 'bigger':
        mainWindow.setSize(1238, 620);
        break;
    }
    
  });

  ipcMainOn('startTcpTest', (payload) => {
    switch (payload) {
      case 'startTcpTest':
        if (!testServer) {
          httpServer = http.createServer();
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
          testServer = net.createServer((socket) => {
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

          testServer.listen(TCP_PORT, () => {
            console.log(`TCP echo server on port ${TCP_PORT}`);
          });

          httpServer.listen(SOCKET_PORT, () => {
            console.log(`Socket.IO server on port ${SOCKET_PORT}`);
          });

        }
      break;
      case "stopTcpTest":
        if (testServer) {
          testServer.close(() => {
            testServer = null;
            httpServer = null;
          });
        }
        if (httpServer) {
        httpServer.close(() => {
          console.log('Test server stopped');
          httpServer = null;
        });
        }
      break;
    }
  });

ipcMain.on('stopTcpTest', () => {
  if (testServer) {
    testServer.close(() => {
      console.log('Test server stopped');
      testServer = null;
      httpServer = null;
    });
  }
});

    createMenu(mainWindow);
    handleCloseEvents(mainWindow);
    new Tray(path.join(getAssetPath(), process.platform === "win32" ? 'icon.ico' : 'icon@2x.png'));

});

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on('close', (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on('before-quit', () => {
    willClose = true;
  });

  mainWindow.on('show', () => {
    willClose = false;
  });
}
