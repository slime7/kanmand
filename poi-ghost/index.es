import fs from 'fs';
import path from 'path';
import React, { Component } from 'react';
import { Checkbox } from 'react-bootstrap';
import { connect } from 'react-redux';
import { observe, observer } from 'redux-observers';
import { createSelector } from 'reselect';
import { configSelector } from 'views/utils/selectors';
import { store } from 'views/create-store';
import PropTypes from 'prop-types';
import axios from 'axios';
import StoreServer from './StoreServer';

const PLUGIN_NAME = 'poi-plugin-ghost';
const storeServer = new StoreServer();
let seeds;
let seed;
let gettingSeeds = false;
const serverIpSelector = state => state.info.server.ip;
const memberIdSelector = state => state.info.basic.api_member_id;
const playerInfoSelector = createSelector(
  [serverIpSelector, memberIdSelector],
  (serverIp, memberId) => ({
    serverIp,
    memberId,
  }),
);
const ghostSelector = createSelector(
  [configSelector],
  config => ({
    logPosition: config.plugin[PLUGIN_NAME].logPosition,
  }),
);
const handleGameResponse = (ev) => {
  const { path: reqPath, postBody } = ev.detail;
  if (/api_req_mission\/start|api_req_sortie\/battle/i.test(reqPath)) {
    const { logPosition } = ghostSelector(store.getState());
    if (logPosition && seed && !gettingSeeds) {
      const type = postBody.api_mission_id ? 'mission' : 'sortie';
      const logDir = path.join(global.APPDATA_PATH, 'mission_log');
      const logFile = path.join(logDir, `${type}_log.csv`);
      const { api_serial_cid: cid } = postBody;
      const cxy = +(cid.substr(10)) / seed;
      const x = +cxy.toString()
        .substr(1, 3);
      const y = +cxy.toString()
        .substr(5, 3);
      const logLine = `${x},${y},="${cid}"\n`;
      fs.appendFileSync(logFile, logLine);
    }
  }
};
const listenSortie = () => {
  window.addEventListener('game.response', handleGameResponse);
};
const unListenSortie = () => {
  window.removeEventListener('game.response', handleGameResponse);
};
const getSeed = async (serverIp, memberId) => {
  if (gettingSeeds) {
    return;
  }

  try {
    gettingSeeds = true;
    if (!seeds) {
      const response = await axios.get(`http://${serverIp}/kcs2/js/main.js`);
      const [, seedsString] = /e.PORT_API_SEED=(\[.*?\]),/.exec(response.data);
      seeds = JSON.parse(seedsString);
    }
    seed = seeds[+memberId % 10];
  } catch (error) {
    console.log('获取 seed 失败', error.message);
  } finally {
    gettingSeeds = false;
  }
};
const createLogFiles = () => {
  const logDir = path.join(global.APPDATA_PATH, 'mission_log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
    fs.writeFileSync(path.join(logDir, 'mission_log.csv'), 'x,y,cid\n');
    fs.writeFileSync(path.join(logDir, 'sortie_log.csv'), 'x,y,cid\n');
  }
};

class SettingComponent extends Component {
  static propTypes = {
    logPosition: PropTypes.bool,
  };

  static defaultProps = {
    logPosition: true,
  };

  handleLogPositionChanged = (ev) => {
    window.config.set(`plugin.${PLUGIN_NAME}.logPosition`, ev.target.checked);
  };

  render() {
    const { logPosition } = this.props;
    return (
      <div id="plugin-ghost-settings">
        <Checkbox
          onChange={this.handleLogPositionChanged}
          checked={logPosition}
        >
          记录远征和出击点击坐标
        </Checkbox>
      </div>
    );
  }
}

const settingsClass = connect(
  state => ghostSelector(state),
)(SettingComponent);

const unsubscribeObserve = observe(store, [
  observer(
    state => playerInfoSelector(state),
    async (dispatch, current, previous) => {
      if (!seed && current.memberId !== previous.memberId) {
        await getSeed(current.serverIp, current.memberId);
      }
    },
  ),
]);

const pluginDidLoad = () => {
  {
    const { serverIp, memberId } = playerInfoSelector(store.getState());
    getSeed(serverIp, memberId);
  }
  createLogFiles();
  listenSortie();
  storeServer.start();
};

const pluginWillUnload = () => {
  storeServer.stop();
  unListenSortie();
  unsubscribeObserve();
};

export {
  settingsClass,
  pluginDidLoad,
  pluginWillUnload,
};
