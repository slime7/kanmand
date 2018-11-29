/* global __static */
<template>
  <div id="app">
    <div class="dq-frame layout-flex flex-column">
      <div class="dq-frame-heading flex-none layout-flex flex-row">
        <strong class="flex-none">kanmand</strong>
        <div class="flex"></div>
        <div id="app-close" class="flex-none" v-on:click="appClose">关闭</div>
      </div>
      <div class="dq-frame-body flex layout-flex flex-column">
        <div class="main-content gap-v-8">
          <Command/>
          <request-line/>
          <Result/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { remote, ipcRenderer } from 'electron'; // eslint-disable-line
import { mapMutations } from 'vuex';
import Command from './components/Command.vue';
import RequestLine from './components/RequestLine.vue';
import Result from './components/Result.vue';

export default {
  name: 'app',
  components: {
    Command,
    RequestLine,
    Result,
  },

  methods: {
    appClose() {
      if (remote) {
        remote.getCurrentWindow().close();
      }
    },
    onReqReply() {
      if (ipcRenderer) {
        ipcRenderer.on('kancolle-command-ipc-reply', (event, requests) => {
          const r = JSON.parse(JSON.stringify(requests));
          this.setRequests(r);
        });
      }
    },
    ...mapMutations(['setRequests']),
  },

  mounted() {
    this.onReqReply();
  },
};
</script>

<style>
  * {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    height: 0;
    width: 0;
  }

  .layout-flex {
    display: flex !important;
  }

  .layout-flex.flex-row {
    flex-direction: row;
  }

  .layout-flex.flex-column {
    flex-direction: column;
  }

  .layout-flex.flex-center {
    align-items: center;
  }

  .layout-flex.flex-space-between {
    justify-content: space-between;
  }

  .layout-flex.flex-wrap {
    flex-wrap: wrap;
  }

  .layout-flex .flex {
    flex: auto;
  }

  .layout-flex .flex-33 {
    flex: 33%;
  }

  .layout-flex .flex-50 {
    flex: 50%;
  }

  .layout-flex .flex-100 {
    flex: 100%;
  }

  .layout-flex .flex-none {
    flex: none;
  }

  .gap-v-8 > *:not(:last-of-type) {
    margin-bottom: 8px;
  }

  body {
    margin: 0;
    font-size: 14px;
  }

  input, textarea, select {
    background-color: #fff;
    border: 1px solid #184179;
    border-radius: 4px;
    color: #000;
    padding: 2px 5px;
    text-align: left;
    outline: none;
  }

  input:disabled, textarea:disabled, select:disabled {
    background-color: #ebebe4;
    color: #545454;
    cursor: not-allowed;
  }

  #app {
    font-family: "Noto Sans", "Noto Sans CJK SC",
    "Microsoft YaHei", "微软雅黑",
    tahoma, arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 1px;
    height: 100vh;
    width: 100vw;
    border-radius: 7px;
    background-image: url("./assets/bg.jpg");
  }

  .dq-frame {
    position: relative;
    border: 2px solid #fff;
    border-radius: 6px;
    height: 100%;
    background: rgba(0, 0, 0, .54);
    color: #fff;
    box-shadow: 0 0 0 1px #000, 0 0 7px 3px #000 inset;
    text-shadow: 0 1px #000, 1px 0 #000, -1px 0 #000, 0 -1px #000;
  }

  .dq-frame-heading, .dq-frame-body {
    position: relative;
    padding: 8px;
  }

  .dq-frame-heading {
    border: none;
    -webkit-app-region: drag;
  }

  .dq-frame-body {
    overflow: auto;
  }

  .dq-frame-heading + .dq-frame-body:before {
    content: ' ';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #fff;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }

  .dq-frame.orange {
    box-shadow: 0 0 0 1px #ff9800, 0 0 7px 3px #ff9800 inset;
    text-shadow: 0 1px #ff9800, 1px 0 #ff9800, -1px 0 #ff9800, 0 -1px #ff9800;
  }

  #app-close {
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  #app-close:hover {
    text-shadow: -1px -1px 2px #5fb4fd,
    1px -1px 2px #5fb4fd,
    -1px 1px 2px #5fb4fd,
    1px 1px 2px #5fb4fd,
    2px 2px 5px #000;
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

  .text-btn {
    cursor: pointer;
    user-select: none;
    margin: 0 2px;
  }

  .text-btn:hover {
    text-shadow: -1px -1px 2px #5fb4fd,
    1px -1px 2px #5fb4fd,
    -1px 1px 2px #5fb4fd,
    1px 1px 2px #5fb4fd,
    2px 2px 5px #000;
  }

  .main-content {
    overflow: scroll;
    flex: 1 1 0%;
  }
</style>
