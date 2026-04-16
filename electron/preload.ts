import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', { title, body }),
  onNotification: (callback: (data: any) => void) =>
    ipcRenderer.on('notification-received', (_event, data) => callback(data)),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
});
