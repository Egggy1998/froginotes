const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;
let bubbleWindow = null;
let isAlwaysOnTop = false;

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

function createMainWindow() {
  const iconPath = path.join(__dirname, '../icon.ico');
  const preloadPath = path.join(__dirname, 'preload.cjs');

  mainWindow = new BrowserWindow({
    width: 1060,
    height: 745,
    minWidth: 900,
    minHeight: 650,
    frame: false,
    transparent: true,
    hasShadow: true,
    icon: iconPath,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(distPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createBubbleWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const iconPath = path.join(__dirname, '../icon.ico');
  const preloadPath = path.join(__dirname, 'preload.cjs');

  bubbleWindow = new BrowserWindow({
    width: 90,
    height: 90,
    x: width - 120,
    y: height - 140,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true, // Do not clutter taskbar
    resizable: false,
    hasShadow: false,
    icon: iconPath,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  bubbleWindow.loadFile(distPath, { query: { collapsed: 'true' } });

  bubbleWindow.on('closed', () => {
    bubbleWindow = null;
    if (!mainWindow || mainWindow.isDestroyed() || !mainWindow.isVisible()) {
      app.quit();
    }
  });
}

app.whenReady().then(() => {
  createMainWindow();

  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    app.quit();
  });

  ipcMain.on('collapse-to-bubble', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
    if (!bubbleWindow || bubbleWindow.isDestroyed()) {
      createBubbleWindow();
    } else {
      bubbleWindow.show();
      bubbleWindow.focus();
    }
  });

  ipcMain.on('bubble-move', (event, { deltaX, deltaY }) => {
    if (bubbleWindow && !bubbleWindow.isDestroyed()) {
      if (typeof deltaX !== 'number' || typeof deltaY !== 'number') return;
      const [currX, currY] = bubbleWindow.getPosition();
      const display = screen.getDisplayNearestPoint({ x: currX, y: currY });
      const { x: sx, y: sy, width: sw, height: sh } = display.workArea;
      const nextX = Math.max(sx, Math.min(sx + sw - 85, currX + deltaX));
      const nextY = Math.max(sy, Math.min(sy + sh - 85, currY + deltaY));
      bubbleWindow.setPosition(Math.round(nextX), Math.round(nextY));
    }
  });

  ipcMain.on('expand-to-window', () => {
    if (bubbleWindow && !bubbleWindow.isDestroyed()) {
      bubbleWindow.hide();
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setAlwaysOnTop(false);
    } else {
      createMainWindow();
    }
  });

  ipcMain.on('show-bubble-context-menu', () => {
    if (!bubbleWindow || bubbleWindow.isDestroyed()) return;
    const menu = Menu.buildFromTemplate([
      {
        label: 'Open FrogiNotes 🍃',
        click: () => {
          if (bubbleWindow) bubbleWindow.hide();
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'New Note',
        click: () => {
          if (bubbleWindow) bubbleWindow.hide();
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('trigger-new-note');
          }
        },
      },
      {
        label: 'Quick Note 📝',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('trigger-quick-note');
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: isAlwaysOnTop,
        click: (item) => {
          isAlwaysOnTop = item.checked;
          if (mainWindow) mainWindow.setAlwaysOnTop(isAlwaysOnTop);
          if (bubbleWindow) bubbleWindow.setAlwaysOnTop(isAlwaysOnTop);
        },
      },
      { type: 'separator' },
      {
        label: 'Quit FrogiNotes',
        click: () => {
          app.quit();
        },
      },
    ]);
    menu.popup({ window: bubbleWindow });
  });

  ipcMain.on('set-always-on-top', (event, flag) => {
    isAlwaysOnTop = flag;
    if (mainWindow) mainWindow.setAlwaysOnTop(flag);
    if (bubbleWindow) bubbleWindow.setAlwaysOnTop(flag);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
