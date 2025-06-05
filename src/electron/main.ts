import  { app, BrowserWindow, Tray } from 'electron';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js'
import { getStaticData, poll } from './resources.js';
import { getAssetPath, getPreloadPath, getUIPath } from './pathResolve.js';
import path from 'path';
import { createMenu } from './menu.js';

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
      webPreferences:{
          preload: getPreloadPath(),
      },
      //frame: false,
      height: 520,
  });
  if(isDev()){
      mainWindow.loadURL('http://localhost:5123');
  } else {
      mainWindow.loadFile(getUIPath());
  }
  poll(mainWindow);
  
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
