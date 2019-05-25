import Vue from 'vue';
import Vuex from 'vuex';
import { routes } from './utils/constant';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    version: null,
    requests: [],
    requestStatus: {
      processing: false,
      index: null,
      total: null,
    },
    lastRequests: [],
    selected: null,
    routes,
    poidata: {
      info: {
        ships: {},
        fleets: [],
        equips: {},
        repairs: [],
        basic: {},
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
    poidataConfig: {
      refresh: 'timeout',
      timeout: 300000,
    },
    memberid: null,
    gameSeed: [],
    savedFleet: [],
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
          const fleetShips = state.poidata.info.fleets
            .reduce((a, c) => [...a, ...c.api_ship], [])
            .filter(s => s !== -1);
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
    setRequestStatus(state, { processing, index, total }) {
      if (typeof processing !== 'undefined' && state.requestStatus.processing !== processing) {
        state.requestStatus.processing = processing;
      }
      if (typeof index !== 'undefined' && state.requestStatus.index !== index) {
        state.requestStatus.index = index;
      }
      if (typeof total !== 'undefined' && state.requestStatus.total !== total) {
        state.requestStatus.total = total;
      }
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
    shipPreEquip(state, {
      action,
      shipId,
      equipId,
      equipInd,
      equipDstInd,
      isExSlot = false,
    }) {
      const oldSlot = JSON.parse(JSON.stringify(state.poidata.info.ships[shipId].api_slot));
      switch (action) {
        default:
        case 'unset':
          if (!isExSlot) {
            const equipIndex = oldSlot.indexOf(equipId);
            oldSlot.splice(equipIndex, 1);
            oldSlot.push(-1);
            state.poidata.info.ships[shipId].api_slot = oldSlot;
          } else {
            state.poidata.info.ships[shipId].api_slot_ex = -1;
          }
          break;
        case 'unsetall':
          state.poidata.info.ships[shipId].api_slot = Array(oldSlot.length).fill(-1);
          break;
        case 'equip':
          if (!isExSlot) {
            oldSlot[equipInd] = equipId;
            state.poidata.info.ships[shipId].api_slot = oldSlot;
          } else {
            state.poidata.info.ships[shipId].api_slot_ex = equipId;
          }
          break;
        case 'exchange':
          [oldSlot[equipInd], oldSlot[equipDstInd]] = [oldSlot[equipDstInd], oldSlot[equipInd]];
          state.poidata.info.ships[shipId].api_slot = oldSlot;
          break;
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
    setPoidataConfig(state, { refresh, timeout }) {
      if (typeof refresh !== 'undefined') {
        state.poidataConfig.refresh = refresh;
      }
      if (typeof timeout !== 'undefined') {
        state.poidataConfig.timeout = +timeout;
      }
    },
    setAppVersion(state, { version }) {
      if (!state.version) {
        state.version = version;
      }
    },
    setMemberid(state, { memberid }) {
      state.memberid = memberid;
    },
    setGameSeed(state, { gameSeed }) {
      state.gameSeed = gameSeed;
    },
    setSavedFleet(state, { fleets }) {
      state.savedFleet = fleets;
    },
  },
});
