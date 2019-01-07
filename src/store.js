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
      state.poidata = poidata;
    },
  },
});
