const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    // subscribeStatistics: (callback) => 
    //     ipcOn("statistics", (stats) => {
    //         callback(stats);
    //     }),
    //     subscribeChangeView: (callback) => 
    //     ipcOn("changeView", (stats) => {
    //         callback(stats);
    //     }),
    // getStaticData: () => ipcInvoke("getStaticData"),

    //changeFrameAction: (payload) => ipcSend('changeFrameAction', payload),
    startTcpTest: (payload) => ipcSend('startTcpTest', payload),
} satisfies Window['electron']);

function ipcInvoke<Key extends keyof EventPayload>(
    key: Key
    ): Promise<EventPayload[Key]>{
        return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayload>(
    key: Key, 
    callback: (payload: EventPayload[Key]) => void
    ){
        const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload)
        electron.ipcRenderer.on(key, cb);
        return() => electron.ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayload>(
  key: Key,
  payload: EventPayload[Key]
) {
  return electron.ipcRenderer.send(key, payload);
}


