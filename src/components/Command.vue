<template>
  <div>
    <div class="input-area gap-v-8">
      <div class="layout-flex flex-row">
        <input class="flex"
               placeholder="游戏链接"
               v-model="gameLink"
               :disabled="!!requests.length">
      </div>
      <div class="layout-flex flex-row">
        <select class="flex" v-model="gameRoute" v-on:change="changeRoute">
          <option disabled value="">发送路径</option>
          <option value="importDataFromString">导入数据</option>
          <option value="importDataFromPoiBattle">复制poi战斗数据所用舰队</option>
          <option v-for="route in routes"
                  :key="route.name"
                  v-bind:value="route">
            {{ route.hint }}({{ route.path }})
          </option>
        </select>
      </div>
      <div class="layout-flex flex-row">
        <textarea class="flex" placeholder="发送数据" rows="5" v-model="gameData"></textarea>
      </div>
    </div>
    <div class="button-group">
      <button class="action-btn" v-on:click="clearCommand">清空队列</button>
      <button class="action-btn" v-on:click="addCommandAction"> 新增</button>
      <button class="action-btn"
              v-on:click="modifyCommand"
              v-show="selected !== null">
        修改
      </button>
      <button class="action-btn" v-on:click="startCommand">执行队列</button>
      <button
        class="action-btn"
        v-on:click="proxyPanel = !proxyPanel"
        :disabled="!!requests.length"
      >
        <span class="proxy-on" v-show="proxy.enabled"></span>
        <span>代理</span>
      </button>
    </div>
    <div class="proxy-panel gap-v-8" v-show="proxyPanel">
      <div>
        <label>
          <input type="checkbox"
                 v-model="proxy.enabled"
                 :disabled="!!requests.length"
                 v-on:change="setProxy">
          <span>启用代理</span>
        </label>
      </div>
      <div class="layout-flex flex-row">
        <input class="flex"
               placeholder="代理地址"
               v-model="proxy.host"
               :disabled="!!requests.length"
               v-on:change="setProxy">
      </div>
      <div class="layout-flex flex-row">
        <input class="flex"
               placeholder="代理端口"
               v-model="proxy.port"
               :disabled="!!requests.length"
               v-on:change="setProxy">
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'Command',

  data() {
    return {
      gameLink: '',
      gameRoute: '',
      gameData: '',
      proxyPanel: false,
      proxy: { enabled: false },
    };
  },

  computed: {
    ...mapState(['requests', 'routes', 'selected']),
  },

  watch: {
    selected() {
      if (this.requests[this.selected]) {
        ({ route: this.gameRoute, data: this.gameData } = this.requests[this.selected]);
      }
    },
  },

  methods: {
    saveLastReqData() {
      const ls = localStorage;
      ls.setItem('gamelink', this.gameLink);
      ls.setItem('gameroute', this.gameRoute.name);
      ls.setItem('gamereqdata', this.gameData);
    },
    restoreLastReqData() {
      const ls = localStorage;
      const [gl, gr, gd] = [
        ls.getItem('gamelink'),
        ls.getItem('gameroute'),
        ls.getItem('gamereqdata'),
      ];
      if (gl) {
        this.gameLink = gl;
      }
      if (gr) {
        [this.gameRoute] = this.routes.filter(r => r.name === gr);
      }
      if (gd) {
        this.gameData = gd;
      }
    },
    addCommandAction() {
      const selectRoute = this.gameRoute;
      if (selectRoute === 'importDataFromString' || selectRoute === 'importDataFromPoiBattle') {
        this.importCommand();
      } else {
        this.addCommand();
      }
    },
    addCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
        this.toasted.show('内容填写不全');
        return;
      }
      const reqData = {
        gameLink: this.gameLink,
        gameRoute: this.gameRoute,
        gameData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-actions', { type: 'add', reqData });
    },
    startCommand() {
      this.clearLastRequests();
      ipcRenderer.send('kancolle-command-actions', { type: 'start' });
    },
    clearCommand() {
      ipcRenderer.send('kancolle-command-actions', { type: 'clear' });
      this.selectEditingRequest(null);
    },
    modifyCommand() {
      if (this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const reqData = {
        gameRoute: this.gameRoute,
        gameData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-actions', {
        type: 'modify',
        reqInd: this.selected,
        reqData,
      });
      this.$toasted.show('修改完成。');
    },
    importCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const importString = this.gameData;
      const reqData = { gameLink: this.gameLink, importString };
      let type;
      if (this.gameRoute === 'importDataFromString') {
        type = 'import';
      } else if (this.gameRoute === 'importDataFromPoiBattle') {
        type = 'poifleets';
      } else {
        type = 'import';
      }
      ipcRenderer.send('kancolle-command-actions', { type, reqData });
    },
    changeRoute() {
      if (this.gameRoute !== 'importDataFromString'
        && this.gameRoute !== 'importDataFromPoiBattle') {
        this.gameData = this.gameRoute.defaultData;
      }
    },
    setProxy() {
      ipcRenderer.send('kancolle-command-actions', { type: 'proxy', proxySetting: this.proxy });
    },
    getProxy() {
      if (ipcRenderer) {
        ipcRenderer.send('get-proxy-setting');
        ipcRenderer.on('proxy-setting', (event, { proxy }) => {
          this.proxy = proxy;
        });
      }
    },
    ...mapMutations([
      'selectEditingRequest',
      'clearLastRequests',
    ]),
  },

  mounted() {
    this.restoreLastReqData();
    this.getProxy();
  },
};
</script>

<style scoped>
  .input-area {
    margin-bottom: 8px;
  }

  .proxy-on {
    display: inline-block;
    vertical-align: top;
    background: center / contain no-repeat url("../assets/key.svg");
    width: 15px;
    height: 15px;
  }
</style>
