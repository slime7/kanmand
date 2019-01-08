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
        state.poidata[path[0]] = {};
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
  },
});
