import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import vuetify from 'vuetify';
import App from '@/App.vue';
import { storeConfig } from '@/store';

describe('App.vue', () => {
  let localVue;
  let wrapper;
  let store;
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
    localVue.use(vuetify);
    store = new Vuex.Store(storeConfig);
    wrapper = shallowMount(App, {
      localVue,
      store,
    });
  });

  it('renders a vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('has #app', () => {
    expect(wrapper.contains('#app')).toBeTruthy();
  });
});
