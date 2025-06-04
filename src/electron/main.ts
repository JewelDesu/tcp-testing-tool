import  { app, BrowserWindow, Tray, IpcMainEvent } from 'electron';
import { ipcMainOn, isDev } from './util.js'
import { poll } from './resources.js';
import { getAssetPath, getPreloadPath, getUIPath } from './pathResolve.js';
import path from 'path';
import { createMenu } from './menu.js';
import { Worker } from "worker_threads";

interface ProxyConfig {
  protocol: "socks5" | "socks4";
  host: string;
  port: number;
}

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
      webPreferences:{
          preload: getPreloadPath(),
      },
      frame: false,
      height: 480,
  });
  if(isDev()){
      mainWindow.loadURL('http://localhost:5123');
  } else {
      mainWindow.loadFile(getUIPath());
  }
  poll(mainWindow);

  ipcMainOn("startTcpTest", (serverAddress: string, event: IpcMainEvent) => {
  const [host, port] = serverAddress.split(":");
  const proxies: ProxyConfig[] = [
    { protocol: "socks5", host: "127.0.0.1", port: 1080 },
    ];

    const worker = new Worker(path.join(__dirname, "tcpWorker.js"), {
      workerData: {
        targetHost: host,
        port: parseInt(port, 10),
        proxies,
        duration: 30,
        packetDelay: 1000,
        packetSize: 64,
      },
    });

    worker.on("message", (msg) => {
      const channel = new BroadcastChannel("tcpTestLogs");
      channel.postMessage(msg.log);
    });

    worker.on("exit", () => {
      console.log("Worker finished");
    });

    event.reply("start-tcp-test-reply", { success: true });
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
