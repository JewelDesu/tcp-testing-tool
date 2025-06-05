import { ipcMain, WebContents, WebFrameMain, IpcMainEvent } from "electron"
import { getUIPath } from "./pathResolve.js";
import { pathToFileURL } from 'url';

export function isDev(): boolean {
    return process.env.NODE_ENV === 'development'
}

export function ipcMainHandle<Key extends keyof EventPayload>(key: Key, handler: () => EventPayload[Key]) {
    ipcMain.handle(key, (event) => {
        validateEventFrame(event.senderFrame!);
        return handler();
    });
}
export function ipcMainOn<Key extends keyof EventPayload>(key: Key, handler: (payload: EventPayload[Key], event: IpcMainEvent) => void) {
  ipcMain.on(key, (event, payload) => {
    validateEventFrame(event.senderFrame!);
    return handler(payload, event);
  });
}

export function ipcWebContentsSend<Key extends keyof EventPayload>(key: Key, webContents: WebContents, payload: EventPayload[Key]){
    webContents.send(key, payload);
}

export function validateEventFrame(frame: WebFrameMain) {
    if (isDev() && new URL(frame.url).host === 'localhost:5123') {
        return;
    }
    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error('BAD event');
    }
}
 