import  { app, BrowserWindow, ipcMain, Tray } from 'electron';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js'
import { getStaticData } from './resources.js';
import { getAssetPath, getPreloadPath, getUIPath } from './pathResolve.js';
import path from 'path';
import { createMenu } from './menu.js';
import net from 'net';

let testServer: net.Server | null = null;

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
      webPreferences:{
          preload: getPreloadPath(),
      },
      //frame: false,
      height: 620,
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

ipcMain.on('startTcpTest', () => {
  if (!testServer) {
    testServer = net.createServer((socket) => {
      console.log('Client connected');

      socket.on('end', () => {
        console.log('Client disconnected');
      });

      socket.write('Hello from server!\n');
    });

    testServer.listen(12345, () => {
      console.log('Test server running on port 12345');
    });
  }
});

ipcMain.on('stop-test-server', () => {
  if (testServer) {
    testServer.close(() => {
      console.log('Test server stopped');
      testServer = null;
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
