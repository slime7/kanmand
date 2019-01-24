import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  screen,
  dialog,
} from 'electron';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import './utils/global';
import KancolleRequest from './utils/KancolleRequest';
import config from './utils/config';
import poidata from './utils/poidata';

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
    width: 800,
    height: 600,
    maximize: false,
  };
  if (defaultWin.y < 0) {
    defaultWin.y = 0;
  }
  let {
    x,
    y,
    width,
    height,
    maximize,
  } = config.get('kanmand.window', defaultWin);
  let proxy = config.get('kanmand.proxy', { enabled: false });

  // Create the browser window.
  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    // transparent: true,
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
  if (maximize) {
    win.maximize();
  }

  // ipc request listen
  let kanmand;

  ipcMain.on('kancolle-command-actions', async (event, {
    type,
    reqData,
    reqInd,
    direction,
    proxySetting,
    poidataPath,
    settingKey,
    settingValue,
    pluginDir,
    currentScriptVersion,
  }) => {
    const reply = (payload) => {
      event.sender.send('kancolle-command-reply', payload);
    };
    const init = (force) => {
      if (force || !kanmand) {
        kanmand = new KancolleRequest();
        const success = kanmand.init(reqData.gameLink);
        if (!success) {
          kanmand = null;
          reply({ error: '游戏链接填写有误' });
        } else {
          kanmand.setStageEndCallback(reply);
          if (proxy && proxy.enabled) {
            kanmand.setProxy({ host: proxy.host, port: proxy.port });
          }
        }
        return !!success;
      }
      return true;
    };

    switch (type) {
      case 'start': {
        if (!kanmand) {
          console.log('请求列表为空');
          break;
        }
        const info = kanmand.requestInfo();
        reply({
          requests: info.requests,
          requestIndex: info.requestIndex,
        });
        await kanmand.start();
        kanmand.clear();
        kanmand = null;
        break;
      }

      case 'add':
        if (init()) {
          kanmand.add(reqData.gameRoute, reqData.gameData);
          reply({ requests: kanmand.requestInfo().requests });
        }
        break;

      case 'clear':
        if (!kanmand) {
          console.log('请求列表为空');
          break;
        }
        kanmand.clear();
        kanmand = null;
        reply({ requests: [] });
        break;

      case 'remove':
        kanmand.remove(reqInd);
        if (kanmand.requestInfo().requests.length === 0) {
          kanmand = null;
          reply({ requests: [] });
        } else {
          reply({ requests: kanmand.requestInfo().requests });
        }
        break;

      case 'move':
        kanmand.move(reqInd, direction);
        reply({ requests: kanmand.requestInfo().requests });
        break;

      case 'modify':
        kanmand.modify(reqInd, reqData);
        reply({ requests: kanmand.requestInfo().requests });
        break;

      case 'import':
        if (init(true)) {
          kanmand.importReq(reqData.importString);
          reply({ requests: kanmand.requestInfo().requests });
        }
        break;

      case 'proxy':
        config.set('kanmand.proxy', proxySetting);
        proxy = proxySetting;
        break;

      case 'isMaximize':
        reply({ maximize });
        break;

      case 'poidata': {
        poidata.fetch(poidataPath)
          .then((result) => {
            reply({ poidata: result });
          })
          .catch(() => {
            reply({ poidata: null });
          });
        break;
      }

      case 'setting': {
        const oldSetting = config.get(settingKey, null);
        if (settingKey && typeof settingValue === 'undefined') {
          reply({
            settingKey,
            settingValue: oldSetting,
          });
        } else if (settingKey && typeof settingValue !== 'undefined') {
          if (oldSetting !== null && typeof oldSetting === 'object') {
            const newSetting = Object.assign({}, oldSetting, settingValue);
            config.set(settingKey, newSetting);
          } else {
            config.set(settingKey, settingValue);
          }
        }
        break;
      }

      case 'saveplugin': {
        const options = {
          defaultPath: 'poi-plugin-ghost.tgz',
          filters: [
            { name: 'poi ghost', extensions: ['tgz'] },
          ],
        };
        dialog.showSaveDialog(options, (filename) => {
          const pluginFile = path.join(pluginDir, 'poi-plugin-ghost.tgz');
          if (filename) {
            fs.copyFile(pluginFile, filename, (fserr) => {
              if (fserr) {
                reply({ error: fserr.message });
              }
            });
          }
        });
        break;
      }

      case 'getSeed': {
        // currentScriptVersion
        let kcsConstResponse;
        try {
          kcsConstResponse = await axios.get('http://203.104.209.7/gadget_html5/js/kcs_const.js');
        } catch (e) {
          console.log('获取kcs_const失败');
        }
        if (kcsConstResponse) {
          const [, scriptVersion] = /VersionInfo\.scriptVesion.*"(.*)";/.exec(kcsConstResponse.data);
          if (scriptVersion !== currentScriptVersion) {
            let kcsMainJsResponse;
            try {
              kcsMainJsResponse = await axios.get(`http://203.104.209.102/kcs2/js/main.js?version=${scriptVersion}`);
            } catch (e) {
              console.log('获取main.js失败');
            }
            if (!kcsMainJsResponse) {
              reply({ error: '获取seed失败了' });
              break;
            }
            const [, seed] = /e.PORT_API_SEED=(\[.*?\]),/.exec(kcsMainJsResponse.data);
            reply({ seed, gameScriptVersion: scriptVersion });
          } else {
            reply({ gameScriptVersion: scriptVersion });
          }
        }
        break;
      }

      case 'devtool':
        win.webContents.openDevTools();
        break;

      case 'appversion':
        reply({ appversion: app.getVersion() });
        break;

      default:
        break;
    }
  });
  ipcMain.on('get-proxy-setting', (event) => {
    event.sender.send('proxy-setting', { proxy });
  });

  win.on('maximize', () => {
    // 最大化
    maximize = true;
    win.webContents.send('kancolle-command-reply', { maximize });
  });

  win.on('unmaximize', () => {
    // 取消最大化：
    maximize = false;
    win.webContents.send('kancolle-command-reply', { maximize });
  });

  win.on('close', () => {
    poidata.close();
    if (!maximize) {
      const pos = win.getPosition();
      const size = win.getSize();
      [x, y, width, height] = [...pos, ...size];
    }
    config.set('kanmand.window', {
      x,
      y,
      width,
      height,
      maximize,
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
