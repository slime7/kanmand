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
        <!--input class="flex" placeholder="发送路径" v-model="gameRoute"-->
        <select class="flex" placeholder="发送路径" v-model="gameRoute">
          <option disabled value="">发送路径</option>
          <option v-for="route in routes"
                  :key="route.name"
                  v-bind:value="route">
            {{ route.name }}({{ route.path }})
          </option>
        </select>
      </div>
      <div class="layout-flex flex-row">
        <textarea class="flex" placeholder="发送数据" rows="5" v-model="gameData"></textarea>
      </div>
    </div>
    <div class="button-group">
      <button class="action-btn" v-on:click="clearCommand">清空队列</button>
      <button class="action-btn" v-on:click="addCommand"> 新增</button>
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
    requests() {
      if (this.requests.length === 0) {
        this.selectEditingRequest(null);
      }
      this.requests.forEach((req) => {
        if (req.error || req.response) {
          this.pushLastRequests(JSON.parse(JSON.stringify(req)));
          this.removeRequest(this.requests.indexOf(req));
        }
      });
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
    addCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const ipcData = {
        gameLink: this.gameLink,
        gameRoute: this.gameRoute,
        gameData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-add-data', ipcData);
    },
    startCommand() {
      this.clearLastRequests();
      ipcRenderer.send('kancolle-command-start');
    },
    clearCommand() {
      ipcRenderer.send('kancolle-command-clear-data');
      this.selectEditingRequest(null);
    },
    modifyCommand() {
      if (this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const ipcData = {
        gameRoute: this.gameRoute,
        gameData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-modify-data', { reqInd: this.selected, ipcData });
    },
    removeCommand() {
      ipcRenderer.send('kancolle-command-remove-data', this.selected);
    },
    ...mapMutations([
      'selectEditingRequest',
      'pushLastRequests',
      'removeRequest',
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
