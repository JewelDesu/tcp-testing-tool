import { app, BrowserWindow, Menu } from "electron";
import { getStaticData } from "./resources.js";
import { ipcWebContentsSend } from "./util.js";

export function createMenu(mainWindow: BrowserWindow) {

    const info = getStaticData().hostName;

    Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
        label: info,
    },
        {
        label: "View",
        type: "submenu",
        submenu: [
        {
            label: "CPU",
            click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'CPU'),
        },
                {
            label: "RAM",
            click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'RAM'),
        },        {
            label: "STORAGE",
            click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'STORAGE'),
        }
    ]
    },
    {
        label: "File",
        type: "submenu",
        submenu: [{
            label: "Quit",
            click: app.quit,
        }]
    },
        {
        label: "DevTools",
        click: () => mainWindow.webContents.openDevTools(),
    },

]));
} 