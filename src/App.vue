/* global __static */
<template>
  <v-container id="app">
    <v-layout column class="dq-frame">
      <v-flex shrink class="dq-frame-heading">
        <v-layout row>
          <v-flex shrink tag="strong">kanmand</v-flex>
          <v-spacer/>
          <v-flex shrink id="app-close" v-on:click="appClose">关闭</v-flex>
        </v-layout>
      </v-flex>
      <v-layout class="flex dq-frame-body">
        <v-layout row class="main-content gap-h-8">
          <v-flex xs6 sm6 md6 lg6 xl6 class="main-left">
            <v-layout column class="flex gap-v-8">
              <Command/>
              <request-line/>
            </v-layout>
          </v-flex>
          <v-flex xs6 sm6 md6 lg6 xl6 class="main-right">
            <v-layout column fill-height>
              <Result/>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import { remote, ipcRenderer } from 'electron'; // eslint-disable-line
import { mapMutations, mapState } from 'vuex';
import Command from './components/Command.vue';
import RequestLine from './components/RequestLine.vue';
import Result from './components/Result.vue';

export default {
  name: 'app',

  computed: {
    ...mapState(['selected']),
  },

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
        ipcRenderer.on('kancolle-command-reply', (event, {
          requestIndex,
          requests,
          error,
        }) => {
          if (error) {
            this.$toasted.error(error);
          }

          if (requests) {
            const requestsCopy = JSON.parse(JSON.stringify(requests));
            if (requestsCopy.length === 0) {
              this.selectEditingRequest(null);
            }

            if (typeof requestIndex === 'number') {
              const [requestsComplated, requestsProgressing] = [[], []];
              while (requestsCopy.length) {
                if (requestsCopy[0].error || requestsCopy[0].response) {
                  requestsComplated.push(requestsCopy.shift());
                } else {
                  requestsProgressing.push(requestsCopy.shift());
                }
              }
              this.setRequests(requestsProgressing);
              this.setLastRequests(requestsComplated);
              if (requestsProgressing.length <= this.selected) {
                this.selectEditingRequest(null);
              }
            } else {
              this.setRequests(requestsCopy);
            }
          }
        });
      }
    },
    ...mapMutations([
      'selectEditingRequest',
      'setRequests',
      'setLastRequests',
    ]),
  },

  mounted() {
    this.onReqReply();
  },
};
</script>

<style>
  * {
    box-sizing: border-box;
  }

  *:not(pre) {
    font-family: "Noto Sans", "Noto Sans CJK SC",
    "Microsoft YaHei", "微软雅黑",
    tahoma, arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  pre {
    font-family: "Source Code Pro", Monospace, "Noto Sans CJK SC", "Microsoft YaHei";
  }

  ::-webkit-scrollbar {
    height: 0;
    width: 0;
  }

  .gap-v-8 > *:not(:last-of-type) {
    margin-bottom: 8px;
  }

  .gap-h-8 > *:not(:last-of-type) {
    margin-right: 8px;
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

  .dq-frame.toasted {
    border-radius: 6px;
    background-color: #000;
    box-shadow: 0 0 0 1px #000, 0 0 7px 3px #000 inset;
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

  .action-btn:disabled {
    background-color: #ebebe4;
    color: #545454;
    cursor: not-allowed;

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

  .main-left, .main-right {
    position: relative;
    max-width: 100vw;
    height: 100%;
    overflow: scroll;
  }
</style>
