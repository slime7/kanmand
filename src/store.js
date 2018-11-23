import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    requests: [],
    count: 0,
  },
  mutations: {
    pushRequests(state, req) {
      console.log(req);
      state.requests.push(req);
      state.count += 1;
      // state.requests = [req];
      console.log(state.requests[0]);
    },
    clearRequests(state) {
      state.requests = [];
    },
    setRequestProp(state, { reqInd, key, value }) {
      state.requests[reqInd] = Vue.set(state.requests[reqInd], key, value);
    },
  },
  actions: {
    addRequests({ commit }, req) {
      commit('pushRequests', req);
    },
  },
});
