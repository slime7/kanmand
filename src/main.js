import Vue from 'vue';
import Toasted from 'vue-toasted';
import App from './App.vue';
import store from './store';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

Vue.config.productionTip = false;

Vue.use(Toasted, {
  className: 'dq-frame',
  position: 'top-center',
  duration: 2000,
});

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
