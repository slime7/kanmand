import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  screen,
  shell,
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

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: { standard: true, secure: true },
}]);

function createWindow() {
  // set position
  const { workArea } = screen.getPrimaryDisplay();
  const defaultWin = {
    x: workArea.width / 2 - 200,
    y: workArea.height / 2 - 300,
    width: 900,
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
    webPreferences: { nodeIntegration: true },
    // transparent: true,
  });
  global.win = win;

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

  // fleets
  const readFleets = () => {
    const fleetsPath = path.join(global.APPDATA_PATH, 'fleets');
    fs.readdir(fleetsPath, (err, files) => {
      if (err) {
        win.webContents.send('kancolle-command-reply', { error: err.message });
      } else {
        const items = files.filter((f) => {
          const ff = path.join(fleetsPath, f);
          const s = fs.statSync(ff);
          return s.isFile();
        }) || [];
        win.webContents.send('kancolle-command-reply', { savedFleet: items });
      }
    });
  };

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
    currentScriptVersion,
    fleetString,
    fleetDesc,
    fleetTarget,
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
        kanmand.newCancelToken();
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

      case 'cancel':
        kanmand.cancel();
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
        const query = poidataPath.map(p => `name=${p}`).join('&');
        axios.get(`http://localhost:10800/store?${query}`)
          .then((response) => {
            reply({ poidata: response.data });
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
            let seedsResponse;
            try {
              seedsResponse = await axios.get('http://localhost:10800/seeds');
            } catch (e) {
              console.log('获取main.js失败');
            }
            if (!seedsResponse) {
              reply({ error: '获取seed失败了' });
              break;
            }
            reply({ seed: seedsResponse.data, gameScriptVersion: scriptVersion });
          } else {
            reply({ gameScriptVersion: scriptVersion });
          }
        }
        break;
      }

      case 'openFleetsDir': {
        const fleetsPath = path.join(global.APPDATA_PATH, 'fleets');
        shell.openItem(fleetsPath);
        break;
      }

      case 'saveFleet': {
        const fleetsPath = path.join(global.APPDATA_PATH, 'fleets');
        if (fleetString.trim() && fleetDesc.trim()) {
          if (!fs.existsSync(fleetsPath)) {
            fs.mkdirSync(fleetsPath);
          }
          const fleetfilename = path.join(fleetsPath, `${fleetDesc.trim()}.json`);
          if (!fs.existsSync(fleetfilename)) {
            const options = {};
            if (process.platform === 'linux') {
              options.mode = 0o600;
            }
            fs.writeFile(fleetfilename, fleetString, options, (err) => {
              if (err) {
                reply({ error: err.message });
              } else {
                readFleets();
              }
            });
          } else {
            reply({ error: '此配置名已存在。' });
          }
        }
        break;
      }

      case 'savedFleet':
        readFleets();
        break;

      case 'loadFleet': {
        const fPath = path.join(global.APPDATA_PATH, 'fleets', fleetDesc);
        if (!fs.existsSync(fPath)) {
          reply({ error: '此配置不存在。' });
        } else {
          fs.readFile(fPath, 'utf8', (err, data) => {
            if (err) {
              reply({ error: err.message });
            } else {
              try {
                const fleet = JSON.parse(data);
                fleet.target = fleetTarget;
                reply({ loadedFleet: JSON.stringify(fleet) });
              } catch (jsonerr) {
                reply({ error: '读取失败，配置可能损坏了' });
              }
            }
          });
        }
        break;
      }

      case 'removeFleet': {
        const fleetsPath = path.join(global.APPDATA_PATH, 'fleets');
        const fPath = path.join(fleetsPath, fleetDesc);
        fs.unlink(fPath, (err) => {
          if (err) {
            reply({ error: `删除失败 ${err.message}` });
          } else {
            readFleets();
          }
        });
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

  // create and watch fleets folder
  if (!fs.existsSync(path.join(global.APPDATA_PATH, 'fleets'))) {
    fs.mkdirSync(path.join(global.APPDATA_PATH, 'fleets'));
  }
  fs.watch(path.join(global.APPDATA_PATH, 'fleets'), (eventType) => {
    if (eventType === 'rename') {
      readFleets();
    }
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
