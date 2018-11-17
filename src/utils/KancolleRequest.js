import axios from 'axios';
import qs from 'qs';

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
    this.requests = [];
    this.loading = 0;
    this.ipcEvent = null;
    this.requestIndex = 0;
  }

  add(route, data) {
    const reqData = {
      api_token: this.gameInfo.gameToken,
      api_verno: 1,
      ...JSON.parse(data),
    };
    this.requests.push({ route, data: reqData });
  }

  requestInfo() {
    return {
      gameInfo: this.gameInfo,
      request: this.requests,
    };
  }

  start(ev) {
    this.loading += 1;
    if (ev) {
      this.ipcEvent = ev;
    }
    this.connect();
  }

  connect() {
    const requestInd = this.requestIndex;

    const self = this;
    const postConfig = {
      url: `http://${this.gameInfo.serverIp}${this.requests[requestInd].route}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: this.gameInfo.serverIp,
        Origin: `http://${this.gameInfo.serverIp}`,
        Referer: this.gameInfo.gameLink,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      },
      data: qs.stringify(this.requests[requestInd].data),
    };
    axios(postConfig)
      .then(r => self.success(r))
      .catch(r => self.failed(r));
  }

  success(response) {
    const requestInd = this.requestIndex;
    this.requests[requestInd].response = response;
    const result = response.data.replace(/[\s\S]*svdata=/, '');
    this.parse(result);
  }

  parse(r) {
    const requestInd = this.requestIndex;

    const json = JSON.parse(r);
    this.requests[requestInd].api_result = getNumber(json, 'api_result');
    this.requests[requestInd].api_result_msg = getString(json, 'api_result_msg');
    this.requests[requestInd].raw_data = getObject(json, 'api_data');
    this.endTask(!!this.requests[requestInd].api_result);
  }

  failed(response) {
    const requestInd = this.requestIndex;
    this.requests[requestInd].response = response;
    this.endTask(false);
  }

  endTask(isSuccess) {
    if (this.loading > 0) {
      this.loading -= 1;
    }
    if (!isSuccess) {
      this.requests[this.requestIndex].error = true;
    }

    this.requestIndex += 1;
    if (this.requestIndex < this.requests.length) {
      this.start();
    } else if (this.ipcEvent) {
      this.ipcEvent.sender.send('kancolle-command-ipc-reply', this.requests);
      console.log('end task');
    }
  }
}
