import Vue from 'vue';
import Vuex from 'vuex';
import { routes } from './utils/constant';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    requests: [],
    lastRequests: [],
    selected: null,
    routes,
    poidata: {},
    pluginInstalled: true,
    tcpLoading: false,
    activeTab: 'result',
    gameLinkStored: '',
  },
  getters: {
    repairShip: (state) => {
      const repairShip = [];
      const repairHp = 100;
      const repairFleetOnly = false;
      if (state.activeTab === 'quickaction'
        && state.poidata.info
        && state.poidata.info.ships
        && state.poidata.info.fleets
        && state.poidata.info.repairs
        && state.poidata.const
        && state.poidata.const.$ships) {
        let searchShips = Object.keys(state.poidata.info.ships)
          .map(shipId => state.poidata.info.ships[shipId]);
        const { repairs } = state.poidata.info;
        const repairingShip = [];
        repairs.forEach((r) => {
          if (r.api_state === 1) {
            repairingShip.push(r.api_ship_id);
          }
        });
        if (repairFleetOnly) {
          const [fleet1, fleet2, fleet3, fleet4] = state.poidata.info.fleets;
          const fleetShips = [
            ...fleet1.api_ship,
            ...fleet2.api_ship,
            ...fleet3.api_ship,
            ...fleet4.api_ship,
          ].filter(s => s !== -1);
          searchShips = searchShips.filter(s => fleetShips.indexOf(s.api_id) >= 0
            && repairingShip.indexOf(s.api_id) === -1);
        }
        searchShips.forEach((ship) => {
          if ((ship.api_nowhp / ship.api_maxhp) < (repairHp / 100)) {
            repairShip.push(ship);
          }
        });
      }

      return repairShip;
    },
  },
  mutations: {
    pushRequests(state, req) {
      state.requests.push(req);
    },
    clearRequests(state) {
      state.requests = [];
    },
    setRequests(state, req) {
      state.requests = req;
    },
    setRequestProp(state, { reqInd, key, value }) {
      state.requests[reqInd] = Vue.set(state.requests[reqInd], key, value);
    },
    removeRequest(state, reqInd) {
      state.requests.splice(reqInd, 1);
    },
    selectEditingRequest(state, selected) {
      state.selected = selected;
    },
    pushLastRequests(state, req) {
      state.lastRequests.push(req);
    },
    setLastRequests(state, req) {
      state.lastRequests = req;
    },
    clearLastRequests(state) {
      state.lastRequests = [];
    },
    setPoidata(state, { poidata, poidataPath }) {
      const path = poidataPath.split('.');
      if (!state.poidata[path[0]]) {
        Vue.set(state.poidata, path[0], {});
      }
      if (!state.poidata[path[0]][path[1]]) {
        Vue.set(state.poidata[path[0]], [path[1]], {});
      }
      state.poidata[path[0]][path[1]] = JSON.parse(poidata);
      state.tcpLoading = false;
      state.pluginInstalled = true;
    },
    shipPreUnset(state, { shipId, equipId, isExSlot = false }) {
      if (!isExSlot) {
        const oldSlot = JSON.parse(JSON.stringify(state.poidata.info.ships[`${shipId}`].api_slot));
        const equipIndex = oldSlot.indexOf(equipId);
        oldSlot.splice(equipIndex, 1);
        oldSlot.push(-1);
        state.poidata.info.ships[`${shipId}`].api_slot = oldSlot;
      } else {
        state.poidata.info.ships[`${shipId}`].api_slot_ex = -1;
      }
    },
    setPluginStatus(state, { installed }) {
      state.tcpLoading = false;
      state.pluginInstalled = installed;
    },
    setTcpStatus(state, { loading }) {
      state.tcpLoading = loading;
    },
    setActiveTab(state, { tab }) {
      state.activeTab = tab;
    },
    setGameLink(state, { gameLink }) {
      state.gameLinkStored = gameLink;
    },
  },
});
