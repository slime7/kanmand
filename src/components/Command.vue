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
            {{ route.path }}
          </option>
        </select>
      </div>
      <div class="layout-flex flex-row">
        <textarea class="flex" placeholder="发送数据" rows="5" v-model="gameData"></textarea>
      </div>
    </div>
    <button class="action-btn" v-on:click="clearCommand">clear</button>
    <button class="action-btn" v-on:click="addCommand">add</button>
    <button class="action-btn" v-on:click="startCommand">send</button>
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
    ...mapState(['requests', 'routes']),
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
        gameReqData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-add-data', ipcData);
    },
    startCommand() {
      ipcRenderer.send('kancolle-command-start');
    },
    clearCommand() {
      ipcRenderer.send('kancolle-command-clear-data');
    },
    onReqReply() {
      if (ipcRenderer) {
        ipcRenderer.on('kancolle-command-ipc-reply', (event, requests) => {
          const r = JSON.parse(JSON.stringify(requests));
          this.setRequests(r);
          // console.log('请求列表: ', r);
        });
      }
    },
    ...mapMutations(['setRequests']),
  },

  mounted() {
    this.onReqReply();
    this.restoreLastReqData();
  },
};
</script>

<style scoped>
  .input-area {
    margin-bottom: 8px;
  }
</style>
