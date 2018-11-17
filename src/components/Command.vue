<template>
  <div>
    <div class="dmd-layout">
      <md-field class="dmd-layout-item dmd-size-100">
        <label>游戏链接</label>
        <md-input v-model="gameLink"></md-input>
      </md-field>
      <md-field class="dmd-layout-item dmd-size-100">
        <label>发送路径</label>
        <md-input v-model="gameRoute"></md-input>
      </md-field>
      <md-field class="dmd-layout-item dmd-size-100">
        <label>发送数据</label>
        <md-textarea v-model="gameData"></md-textarea>
      </md-field>
    </div>
    <md-button class="md-raised md-layout-item" v-on:click="startCommand">send</md-button>
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
    };
  },

  methods: {
    startCommand() {
      const ipcData = {
        gameLink: this.gameLink,
        gameRoute: this.gameRoute,
        gameReqData: this.gameData,
      };
      console.log(ipcData);
      ipcRenderer.send('kancolle-command-ipc-data', ipcData);
    },
    onReqReply() {
      ipcRenderer.on('kancolle-command-ipc-reply', (event, requests) => {
        console.log('请求完成: ', requests);
      });
    },
  },

  mounted() {
    this.onReqReply();
  },
};
</script>

<style scoped>

</style>
