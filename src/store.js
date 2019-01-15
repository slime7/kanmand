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
    poidata: {
      info: {
        ships: {},
        fleets: [],
        equips: {},
        repairs: [],
      },
      const: {
        $ships: {},
      },
    },
    pluginInstalled: true,
    tcpLoading: false,
    activeTab: 'result',
    gameLinkStored: '',
    repairFilter: {
      hp: 50,
      infleet: true,
    },
  },
  getters: {
    repairShip: (state) => {
      const repairShip = [];
      const repairHp = state.repairFilter.hp;
      const repairFleetOnly = state.repairFilter.infleet;
      if (state.activeTab === 'quickaction'
        && state.poidata.info
        && state.poidata.info.ships
        && state.poidata.info.fleets
        && state.poidata.info.fleets.length
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
          searchShips = searchShips.filter(s => fleetShips.indexOf(s.api_id) >= 0);
        }
        searchShips.filter(s => repairingShip.indexOf(s.api_id) === -1)
          .forEach((ship) => {
            if ((ship.api_nowhp / ship.api_maxhp) < (repairHp / 100)) {
              repairShip.push(ship);
            }
          });
      }

      repairShip.sort((a, b) => (a.api_nowhp / a.api_maxhp) - (b.api_nowhp / b.api_maxhp));
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
    setPoidata(state, { poidata }) {
      try {
        state.poidata = Object.assign({}, state.poidata, JSON.parse(poidata));
      } catch (e) {
        console.log(`转换数据出错: ${e.message}`);
      }
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
    setRepairFilter(state, { hp, infleet }) {
      if (typeof hp !== 'undefined') {
        state.repairFilter.hp = +hp;
      }
      if (typeof infleet !== 'undefined') {
        state.repairFilter.infleet = infleet;
      }
    },
  },
});
