import axios from 'axios';
import qs from 'qs';
import store from '../store';

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
  constructor(gameLink) {
    this.gameInfo = {
      ...parseGameLink(gameLink),
      gameLink,
    };
    // this.requests = store.state.requests;
    this.loading = 0;
    this.requestIndex = 0;
  }

  add(route, data) {
    const reqData = {
      api_token: this.gameInfo.gameToken,
      api_verno: 1,
      ...JSON.parse(data),
    };
    // this.requests.push({ route, data: reqData });
    store.commit('pushRequests', { route, data: reqData });
  }

  clear() {
    store.commit('clearRequests');
    this.loading = 0;
    this.requestIndex = 0;
  }

  requestInfo() {
    return {
      gameInfo: this.gameInfo,
      request: store.state.requests,
    };
  }

  async start() {
    this.loading += 1;
    try {
      const response = await this.connect();
      await this.success(response);
    } catch (error) {
      await this.failed(error);
    }
  }

  async connect() {
    const requestInd = this.requestIndex;
    const request = store.state.requests[requestInd];

    const postConfig = {
      url: `http://${this.gameInfo.serverIp}${request.route}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: this.gameInfo.serverIp,
        Origin: `http://${this.gameInfo.serverIp}`,
        Referer: this.gameInfo.gameLink,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      },
      data: qs.stringify(request.data),
    };
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
    // this.requests[requestInd].response = response;
    store.commit('setRequestProp',
      {
        reqInd: requestInd,
        key: 'response',
        value: response,
      });
    const result = response.data.replace(/[\s\S]*svdata=/, '');
    await this.parse(result);
  }

  async parse(r) {
    const requestInd = this.requestIndex;
    const request = store.state.requests[requestInd];

    const json = JSON.parse(r);
    // this.requests[requestInd].api_result = getNumber(json, 'api_result');
    // this.requests[requestInd].api_result_msg = getString(json, 'api_result_msg');
    // this.requests[requestInd].raw_data = getObject(json, 'api_data');
    store.commit('setRequestProp',
      {
        reqInd: requestInd,
        key: 'responseData',
        value: {
          api_result: getNumber(json, 'api_result'),
          api_result_msg: getString(json, 'api_result_msg'),
          raw_data: getObject(json, 'api_data'),
        },
      });
    await this.endTask(!!request.api_result);
  }

  async failed(error) {
    const requestInd = this.requestIndex;
    // this.requests[requestInd].error = error;
    store.commit('setRequestProp',
      {
        reqInd: requestInd,
        key: 'error',
        value: error,
      });
    await this.endTask(true);
  }

  async endTask(isApiSuccess) {
    const requestInd = this.requestIndex;
    if (this.loading > 0) {
      this.loading -= 1;
    }
    if (!isApiSuccess) {
      // this.requests[this.requestIndex].api_error = true;
      store.commit('setRequestProp',
        {
          reqInd: requestInd,
          key: 'api_error',
          value: true,
        });
    }

    this.requestIndex += 1;
    if (requestInd < store.state.requests.length) {
      await this.start();
    } else {
      console.log('end task');
    }
  }
}
