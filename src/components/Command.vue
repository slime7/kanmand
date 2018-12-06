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
      if (selectRoute === 'importDataFromString') {
        this.importCommand();
      } else {
        this.addCommand();
      }
    },
    addCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
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
    },
    importCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const importString = this.gameData;
      const reqData = { gameLink: this.gameLink, importString };
      ipcRenderer.send('kancolle-command-actions', { type: 'import', reqData });
    },
    changeRoute() {
      if (this.gameRoute !== 'importDataFromString') {
        this.gameData = this.gameRoute.defaultData;
      }
    },
    ...mapMutations([
      'selectEditingRequest',
      'clearLastRequests',
    ]),
  },

  mounted() {
    this.restoreLastReqData();
  },
};
</script>

<style scoped>
  .input-area {
    margin-bottom: 8px;
  }
</style>
