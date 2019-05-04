import axios from 'axios';
import qs from 'qs';
import { routes } from './constant';

function getProp(json, jsonKey, defaultValue) {
  if (json !== null && Object.prototype.hasOwnProperty.call(json, jsonKey)) {
    const i = json[jsonKey];
    if (i !== null && typeof i !== 'undefined') {
      return i;
    }
  }
  return defaultValue;
}

function getNumber(json, jsonKey) {
  return getProp(json, jsonKey, 0);
}

function getString(json, jsonKey) {
  const s = getProp(json, jsonKey, '');
  return s === null ? '' : s;
}

function getObject(json, jsonKey) {
  return getProp(json, jsonKey, null);
}

function parseGameLink(link) {
  const regexp = /:\/\/(.*?)\/.*version=(.*?)&.*api_token=([a-z0-9]{40})&.*api_starttime=(\d{13})/;
  const regMatchResult = regexp.exec(link);
  if (regMatchResult) {
    return {
      serverIp: regMatchResult[1],
      gameVersion: regMatchResult[2],
      gameToken: regMatchResult[3],
      gameTime: regMatchResult[4],
    };
  }
  return null;
}

function debuglog(msg) {
  global.win.webContents.send('kancolle-command-reply', { debuglog: msg });
}

export default class KancolleRequest {
  constructor() {
    this.gameInfo = null;
    this.loading = 0;
    this.requests = [];
    this.requestIndex = 0;
    this.stageEndCallback = null;
  }

  setStageEndCallback(stageEndCallback) {
    this.stageEndCallback = stageEndCallback;
  }

  init(gameLink) {
    const gameBaseInfo = parseGameLink(gameLink);
    if (gameBaseInfo) {
      this.gameInfo = {
        ...gameBaseInfo,
        gameLink,
      };
      axios.defaults.baseURL = `http://${this.gameInfo.serverIp}/`;
      return this;
    }
    return false;
  }

  add(route, data) {
    if (!this.loading) {
      this.requests.push({ route, data });
    }
  }

  clear() {
    this.requests = [];
    this.loading = 0;
    this.requestIndex = 0;
    // this.stageEndCallback = null;
  }

  remove(reqInd) {
    this.requests.splice(reqInd, 1);
  }

  move(reqInd, direction) {
    const moveReq = JSON.stringify(this.requests.splice(reqInd, 1)[0]);
    this.requests.splice(reqInd + direction, 0, JSON.parse(moveReq));
  }

  modify(reqInd, reqData) {
    this.requests[reqInd] = { route: reqData.gameRoute, data: reqData.gameData };
  }

  importReq(importString) {
    if (!importString) {
      return;
    }
    let im;
    try {
      const imj = Buffer.from(importString, 'base64').toString();
      im = JSON.parse(imj);
      if (!im.requests) {
        return;
      }
      this.clear();
      im.requests.forEach((r) => {
        const [route] = routes.filter(ro => ro.name === r.ro);
        const data = r.da;
        if (route) {
          this.add(route, data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  requestInfo() {
    return {
      gameInfo: this.gameInfo,
      requests: this.requests,
      requestIndex: this.requestIndex,
    };
  }

  setProxy(proxy) {
    this.proxy = proxy;
  }

  async start() {
    this.loading += 1;
    if (global.win) {
      global.win.setProgressBar(0.01, { mode: 'normal' });
    }
    const self = this;
    const doReq = async function doReq() {
      const requestInd = self.requestIndex;
      let response;
      try {
        response = await self.connect(self.requests[requestInd]);
      } catch (error) {
        debuglog(error.message);
        debuglog(error);
        if (error.response) {
          self.requests[requestInd].error = error.response;
        } else if (error.request) {
          self.requests[requestInd].error = error.request;
        } else {
          self.requests[requestInd].error = error.message;
        }

        // 遇到370自动重试而不是跟踪重定向，最多尝试5次
        if (error.response && error.response.status === 307) {
          delete self.requests[requestInd].error;
          if (self.requests[requestInd].retry) {
            self.requests[requestInd].retry += 1;
          } else {
            self.requests[requestInd].retry = 1;
          }
          if (self.requests[requestInd].retry >= 5) {
            self.endTask(true);
          }
        } else {
          self.endTask(true);
        }
      }
      if (response) {
        if (response.data !== '') {
          self.success(response);
        } else {
          self.requests[requestInd].error = '网络出错。';
          self.endTask();
        }
      }
    };
    while (this.requestIndex < this.requests.length) {
      await doReq(); // eslint-disable-line no-await-in-loop
    }
  }

  async connect(request) {
    const reqData = {
      api_token: this.gameInfo.gameToken,
      api_verno: 1,
      ...JSON.parse(request.data),
    };

    const postConfig = {
      url: request.route.path,
      method: 'POST',
      // 暂时禁止重定向跟踪
      maxRedirects: 0,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: this.gameInfo.serverIp,
        Origin: `http://${this.gameInfo.serverIp}`,
        Referer: this.gameInfo.gameLink,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      },
      data: qs.stringify(reqData),
    };
    if (this.proxy) {
      postConfig.proxy = this.proxy;
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios(postConfig);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  success(response) {
    const requestInd = this.requestIndex;
    this.requests[requestInd].response = response;
    const result = response.data.replace(/[\s\S]*svdata=/, '');
    this.parse(result);
  }

  parse(r) {
    const requestInd = this.requestIndex;
    const request = this.requests[requestInd];

    const json = JSON.parse(r);
    request.responseData = {
      api_result: getNumber(json, 'api_result'),
      api_result_msg: getString(json, 'api_result_msg'),
      raw_data: getObject(json, 'api_data'),
    };
    this.endTask(request.responseData.api_result === 1);
  }

  endTask(isApiSuccess) {
    if (this.loading > 0) {
      this.loading -= 1;
    }
    if (typeof isApiSuccess !== 'undefined' && !isApiSuccess) {
      this.requests[this.requestIndex].api_error = true;
    }

    if (typeof this.stageEndCallback === 'function') {
      let errorMessage;
      if (typeof isApiSuccess !== 'undefined' && !isApiSuccess) {
        errorMessage = `${this.requestIndex + 1}: 游戏返回了错误。`;
      }
      if (this.requests[this.requestIndex].error) {
        if (typeof this.requests[this.requestIndex].error === 'string') {
          errorMessage = `${this.requestIndex + 1}: ${this.requests[this.requestIndex].error}`;
        } else {
          errorMessage = `${this.requestIndex + 1}: 网络出错。`;
        }
      }
      this.stageEndCallback({
        requests: this.requests,
        requestIndex: this.requestIndex,
        error: errorMessage,
      });
    }

    // 设置 windows taskbar 进度条
    if (global.win) {
      const progressPercent = (this.requestIndex + 1) / this.requests.length;
      global.win.setProgressBar(progressPercent, { mode: 'normal' });
      if (progressPercent === 1) {
        setTimeout(() => {
          global.win.setProgressBar(-1);
        }, 500);
      }
    }

    this.requestIndex += 1;
  }
}
