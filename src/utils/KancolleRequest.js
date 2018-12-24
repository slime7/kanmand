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
      return this;
    }
    return false;
  }

  add(route, data) {
    this.requests.push({ route, data });
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
      const imj = Buffer.from(importString, 'base64').toString('ascii');
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
    };
  }

  setProxy(proxy) {
    this.proxy = proxy;
  }

  async start() {
    this.loading += 1;
    try {
      const response = await this.connect();
      await this.success(response);
    } catch (error) {
      const requestInd = this.requestIndex;
      this.requests[requestInd].error = error;
      if (error.response) {
        this.requests[requestInd].error = error.response;
      } else if (error.request) {
        this.requests[requestInd].error = error.request;
      } else {
        this.requests[requestInd].error = error.message;
      }
      await this.endTask(true);
    }
  }

  async connect() {
    const requestInd = this.requestIndex;
    const request = this.requests[requestInd];
    const reqData = {
      api_token: this.gameInfo.gameToken,
      api_verno: 1,
      ...JSON.parse(request.data),
    };

    const postConfig = {
      url: `http://${this.gameInfo.serverIp}${request.route.path}`,
      method: 'POST',
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

    try {
      const response = await axios(postConfig);
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
  }

  async success(response) {
    const requestInd = this.requestIndex;
    this.requests[requestInd].response = response;
    const result = response.data.replace(/[\s\S]*svdata=/, '');
    await this.parse(result);
  }

  async parse(r) {
    const requestInd = this.requestIndex;
    const request = this.requests[requestInd];

    const json = JSON.parse(r);
    request.responseData = {
      api_result: getNumber(json, 'api_result'),
      api_result_msg: getString(json, 'api_result_msg'),
      raw_data: getObject(json, 'api_data'),
    };
    await this.endTask(!!request.responseData.api_result);
  }

  async endTask(isApiSuccess) {
    if (this.loading > 0) {
      this.loading -= 1;
    }
    if (!isApiSuccess) {
      this.requests[this.requestIndex].api_error = true;
    }

    if (typeof this.stageEndCallback === 'function') {
      this.stageEndCallback(this.requests, this.requestIndex);
    }
    this.requestIndex += 1;
    if (this.requestIndex < this.requests.length) {
      await this.start();
    } else {
      console.log('end task');
    }
  }
}
