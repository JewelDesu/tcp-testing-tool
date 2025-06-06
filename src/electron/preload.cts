const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  getStaticData: () => ipcInvoke("getStaticData"),
  changeFrameAction: (payload) => ipcSend('changeFrameAction', payload),
  startTcpTest: (payload) => ipcSend('startTcpTest', payload),
  resizeWindow: (payload) => ipcSend('resizeWindow', payload ),
} satisfies Window['electron']);

function ipcInvoke<Key extends keyof EventPayload>(
    key: Key
    ): Promise<EventPayload[Key]>{
        return electron.ipcRenderer.invoke(key);
}

function ipcSend<Key extends keyof EventPayload>(
  key: Key,
  payload: EventPayload[Key]
) {
  return electron.ipcRenderer.send(key, payload);
}


