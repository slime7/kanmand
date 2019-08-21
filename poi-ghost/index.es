import fs from 'fs';
import path from 'path';
import React, { Component } from 'react';
import { Checkbox } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { configSelector } from 'views/utils/selectors';
import { store } from 'views/create-store';
import PropTypes from 'prop-types';
import StoreServer from './StoreServer';

const PLUGIN_NAME = 'poi-plugin-ghost';
const storeServer = new StoreServer();
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
const handleGameResponse = async (ev) => {
  const { path: reqPath, postBody } = ev.detail;
  if (/api_req_mission\/start|api_req_sortie\/battle/i.test(reqPath)) {
    const { logPosition } = ghostSelector(store.getState());
    const { memberId } = playerInfoSelector(store.getState());
    if (logPosition) {
      const seed = await storeServer.seedManager.seed(memberId);
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

const pluginDidLoad = () => {
  storeServer.seedManager.getSeeds();
  createLogFiles();
  listenSortie();
  storeServer.start();
};

const pluginWillUnload = () => {
  storeServer.stop();
  unListenSortie();
};

export {
  settingsClass,
  pluginDidLoad,
  pluginWillUnload,
};
