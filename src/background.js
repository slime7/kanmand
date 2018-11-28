/* eslint-disable */
import { app, protocol, BrowserWindow, ipcMain, screen } from 'electron';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
/* eslint-enable */
import './utils/global';
import KancolleRequest from './utils/KancolleRequest';
import config from './utils/config';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });

function createWindow() {
  // set position
  const { workArea } = screen.getPrimaryDisplay();
  const defaultWin = {
    x: workArea.width / 2 - 200,
    y: workArea.height / 2 - 300,
    width: 400,
    height: 600,
  };
  if (defaultWin.y < 0) {
    defaultWin.y = 0;
  }
  let {
    x,
    y,
    width,
    height,
  } = config.get('kanmand.window', defaultWin);

  // Create the browser window.
  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
  });

  if (isDevelopment || process.env.IS_TEST) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  // ipc request listen
  let kanmand;

  ipcMain.on('kancolle-command-actions', async (event, {
    type,
    reqData,
    reqInd,
    direction,
  }) => {
    const init = () => {
      if (!kanmand) {
        kanmand = new KancolleRequest(reqData.gameLink);
      }
    };
    const reply = (data) => {
      event.sender.send('kancolle-command-ipc-reply', data);
    };

    switch (type) {
      case 'start':
        if (!kanmand) {
          console.log('请求列表为空');
          break;
        }
        await kanmand.start(() => {
          event.sender.send('kancolle-command-ipc-reply', kanmand.requestInfo().requests);
        });
        kanmand.clear();
        kanmand = null;
        break;

      case 'add':
        init();
        kanmand.add(reqData.gameRoute, reqData.gameData);
        reply(kanmand.requestInfo().requests);
        break;

      case 'clear':
        if (!kanmand) {
          console.log('请求列表为空');
          break;
        }
        kanmand.clear();
        kanmand = null;
        reply([]);
        break;

      case 'remove':
        kanmand.remove(reqInd);
        if (kanmand.requestInfo().requests.length === 0) {
          kanmand = null;
          reply([]);
        } else {
          reply(kanmand.requestInfo().requests);
        }
        break;

      case 'move':
        kanmand.move(reqInd, direction);
        reply(kanmand.requestInfo().requests);
        break;

      case 'modify':
        kanmand.modify(reqInd, reqData);
        reply(kanmand.requestInfo().requests);
        break;

      default:
        break;
    }
  });

  win.on('close', () => {
    const pos = win.getPosition();
    const size = win.getSize();
    [x, y, width, height] = [...pos, ...size];
    config.set('kanmand.window', {
      x,
      y,
      width,
      height,
    });
  });

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools();
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
