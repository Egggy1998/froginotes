const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  collapseToBubble: () => ipcRenderer.send('collapse-to-bubble'),
  expandToWindow: () => ipcRenderer.send('expand-to-window'),
  moveBubble: (deltaX, deltaY) => ipcRenderer.send('bubble-move', { deltaX, deltaY }),
  showBubbleContextMenu: () => ipcRenderer.send('show-bubble-context-menu'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  onTriggerNewNote: (callback) => ipcRenderer.on('trigger-new-note', callback),
  onTriggerQuickNote: (callback) => ipcRenderer.on('trigger-quick-note', callback),
});
