import path from 'path';
import fs from 'fs';
import { defaultSetting } from './constant';

const { APPDATA_PATH } = global;
const configFile = path.join(APPDATA_PATH, 'config.json');

class Config {
  constructor() {
    this.configData = null;
    try {
      const configContent = fs.readFileSync(configFile, { encoding: 'utf8' });
      this.configData = {
        kanmand:
          Object.assign(defaultSetting, JSON.parse(configContent).kanmand),
      };
    } catch (err) {
      this.configData = { kanmand: defaultSetting };
      console.log(err);
    }
  }

  get(valuePath, defaultValue) {
    if (valuePath === '') {
      return this.configData;
    }
    const pathKey = valuePath.split('.');
    let ret = this.configData;
    for (let i = 0; i < pathKey.length; i += 1) {
      if (Object.prototype.hasOwnProperty.call(ret, pathKey[i])) {
        ret = ret[pathKey[i]];
      } else {
        ret = defaultValue;
        break;
      }
    }
    return ret;
  }

  set(valuePath, value) {
    const pathKey = valuePath.split('.');
    let cur = this.configData;
    while (pathKey.length > 1) {
      const curKey = pathKey.shift();
      if (!Object.prototype.hasOwnProperty.call(cur, curKey)) {
        cur[curKey] = {};
      }
      cur = cur[curKey];
    }
    cur[pathKey.shift()] = value;

    this.save();
  }

  save() {
    try {
      fs.writeFileSync(configFile, JSON.stringify(this.configData, null, 2));
    } catch (err) {
      console.log(err);
    }
  }
}

const config = new Config();
export default config;
