import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import vuetify from 'vuetify';
import App from '@/App.vue';
import store from '@/store';

describe('test', () => {
  let localVue;
  let wrapper;
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
    localVue.use(vuetify);
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
