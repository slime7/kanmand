<template>
  <div>
    <div class="input-area gap-v-8">
      <div class="layout-flex flex-row">
        <input class="flex" placeholder="游戏链接" v-model="gameLink">
      </div>
      <div class="layout-flex flex-row">
        <input class="flex" placeholder="发送路径" v-model="gameRoute">
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

export default {
  name: 'Command',

  data() {
    return {
      gameLink: '',
      gameRoute: '',
      gameData: '',
      requests: null,
    };
  },

  methods: {
    saveLastReqData() {
      const ls = localStorage;
      ls.setItem('gamelink', this.gameLink);
      ls.setItem('gameroute', this.gameRoute);
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
        this.gameRoute = gr;
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
      ipcRenderer.on('kancolle-command-ipc-reply', (event, requests) => {
        const r = JSON.parse(JSON.stringify(requests));
        this.requests = r;
        console.log('请求列表: ', JSON.parse(JSON.stringify(r)));
      });
    },
  },

  mounted() {
    this.onReqReply();
    this.restoreLastReqData();
  },
};
</script>

<style scoped>
  .gap-v-8 > *:not(:last-of-type) {
    margin-bottom: 8px;
  }

  .input-area {
    margin-bottom: 8px;
  }

  .action-btn {
    border: 2px #fff solid;
    background-color: #5fb4fd;
    color: #fff;
    outline: none;
    cursor: pointer;
    height: 32px;
    min-width: 64px;
    padding: 2px 8px;
    border-radius: 16px;
    margin: 2px 6px;
  }
</style>
