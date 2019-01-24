/* global __static */
<template>
  <v-container fluid id="app">
    <v-layout column class="dq-frame strong-shadow win" :class="{ max: maximize}">
      <v-flex shrink class="dq-frame-header padding-8">
        <v-layout row>
          <v-flex shrink tag="strong">kanmand</v-flex>
          <v-spacer/>
          <v-flex
            shrink
            class="titlebar-btn"
            v-on:click="appMinimize">
            <v-icon dark size="20">minimize</v-icon>
          </v-flex>
          <v-flex
            shrink
            class="titlebar-btn"
            v-on:click="appMaximize(true)"
            v-show="!maximize">
            <v-icon dark size="20">fullscreen</v-icon>
          </v-flex>
          <v-flex
            shrink
            class="titlebar-btn"
            v-on:click="appMaximize(false)"
            v-show="maximize">
            <v-icon dark size="20">fullscreen_exit</v-icon>
          </v-flex>
          <v-flex shrink id="app-close" class="titlebar-btn" v-on:click="appClose">
            <v-icon dark size="20">close</v-icon>
          </v-flex>
        </v-layout>
      </v-flex>
      <div class="divider"></div>
      <v-layout class="flex dq-frame-body main-container">
        <v-layout row class="main-content">
          <v-flex xs6 sm6 md6 lg4 xl3 class="main-left">
            <v-layout column fill-height class="flex">
              <Command/>
              <div class="divider"></div>
              <request-line/>
            </v-layout>
          </v-flex>
          <div class="divider"></div>
          <v-flex xs6 sm6 md6 lg8 xl9 class="main-right">
            <v-layout column fill-height class="padding-8">
              <right-tab/>
              <Result v-show="activeTab === 'result'"/>
              <quick-action v-show="activeTab === 'quickaction'"/>
              <Setting v-show="activeTab === 'setting'"/>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import { remote, ipcRenderer } from 'electron';
import { mapMutations, mapState } from 'vuex';
import Command from './components/Command.vue';
import RequestLine from './components/RequestLine.vue';
import Result from './components/Result.vue';
import RightTab from './components/RightTab.vue';
import QuickAction from './components/QuickAction.vue';
import Setting from './components/Setting.vue';

export default {
  name: 'app',

  components: {
    Setting,
    QuickAction,
    Command,
    RequestLine,
    Result,
    RightTab,
  },

  data() {
    return {
      maximize: false,
      poidataRefreshTimeout: null,
    };
  },

  computed: {
    ...mapState([
      'selected',
      'activeTab',
      'tcpLoading',
      'poidata',
      'poidataConfig',
      'pluginInstalled',
      'memberid',
    ]),
  },

  watch: {
    'poidataConfig.refresh': function (refresh) {
      this.poidataTimeoutRefresh(refresh === 'timeout');
    },
    'poidataConfig.timeout': function () {
      this.poidataTimeoutRefresh(this.poidataConfig.refresh === 'timeout');
    },
  },

  methods: {
    appClose() {
      if (remote) {
        remote.getCurrentWindow().close();
      }
    },
    appMaximize(enter = true) {
      if (remote) {
        if (enter) {
          remote.getCurrentWindow().maximize();
        } else {
          remote.getCurrentWindow().unmaximize();
        }
      }
    },
    appMinimize() {
      if (remote) {
        remote.getCurrentWindow().minimize();
      }
    },
    poidataRefresh() {
      const dataPath = [
        'info.ships',
        'info.fleets',
        'info.equips',
        'info.repairs',
        'info.basic',
      ];
      if (!Object.keys(this.poidata.const.$ships).length) {
        dataPath.push('const.$ships');
      }
      this.setTcpStatus({ loading: true });
      ipcRenderer.send('kancolle-command-actions', { type: 'poidata', poidataPath: dataPath });
    },
    poidataTimeoutRefresh(enable) {
      clearInterval(this.poidataRefreshTimeout);
      if (enable) {
        this.poidataRefreshTimeout = setInterval(this.poidataRefresh, this.poidataConfig.timeout);
      }
    },
    getLocalGameSeed() {
      const storedSeed = localStorage.getItem('gameseed');
      if (storedSeed) {
        const seed = JSON.parse(storedSeed);
        ipcRenderer.send('kancolle-command-actions', {
          type: 'getSeed',
          currentScriptVersion: seed.version,
        });
      } else {
        ipcRenderer.send('kancolle-command-actions', { type: 'getSeed' });
      }
    },
    onReqReply() {
      if (ipcRenderer) {
        ipcRenderer.on('kancolle-command-reply', (event, {
          requestIndex,
          requests,
          error,
          maximize,
          poidata,
          settingKey,
          settingValue,
          appversion,
          seed,
          gameScriptVersion,
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
              this.setRequestStatus({
                processing: true,
                index: requestIndex,
                total: requests.length,
              });
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
              if (requestsProgressing.length === 0) {
                this.setRequestStatus({
                  processing: false,
                  index: null,
                  total: null,
                });
              }
              if (requestsProgressing.length === 0
                && this.pluginInstalled && !this.tcpLoading
                && this.poidataConfig.refresh === 'requested') {
                this.poidataRefresh();
              }
            } else {
              this.setRequests(requestsCopy);
            }
          }

          // 最大化
          if (typeof maximize !== 'undefined') {
            this.maximize = maximize;
          }
          // poidata
          if (typeof poidata !== 'undefined' && poidata) {
            this.setPoidata({ poidata });
          }
          if (typeof poidata !== 'undefined' && !poidata) {
            this.setPluginStatus({ install: false });
          }
          if (typeof appversion !== 'undefined') {
            this.setAppVersion({ version: appversion });
          }
          // 游戏 seed
          if (typeof gameScriptVersion !== 'undefined') {
            if (typeof seed !== 'undefined') {
              const gameSeed = JSON.parse(seed);
              const seedAndVersion = JSON.stringify({
                seed: gameSeed,
                version: gameScriptVersion,
              });
              this.setGameSeed({ gameSeed });
              localStorage.setItem('gameseed', seedAndVersion);
            } else {
              const storedSeed = localStorage.getItem('gameseed');
              const gameSeed = JSON.parse(storedSeed).seed;
              this.setGameSeed({ gameSeed });
            }
          }
          // 设置
          if (settingKey && settingValue) {
            if (settingKey === 'kanmand.repair') {
              this.setRepairFilter(settingValue);
            }
            if (settingKey === 'kanmand.poidata') {
              this.setPoidataConfig(settingValue);
              this.poidataTimeoutRefresh(this.poidataConfig.refresh === 'timeout');
            }
            if (settingKey === 'kanmand.memberid' && settingValue && settingValue !== this.memberid) {
              this.setMemberid({ memberid: settingValue });
            }
          }
        });
      }
    },
    ...mapMutations([
      'selectEditingRequest',
      'setRequests',
      'setLastRequests',
      'setPoidata',
      'setPluginStatus',
      'setTcpStatus',
      'setRepairFilter',
      'setPoidataConfig',
      'setAppVersion',
      'setGameSeed',
      'setMemberid',
      'setRequestStatus',
    ]),
  },

  mounted() {
    const app = this;
    this.onReqReply();
    ipcRenderer.send('kancolle-command-actions', { type: 'isMaximize' });
    this.getLocalGameSeed();
    setTimeout(() => {
      app.poidataRefresh();
    }, 100);
    // ipcRenderer.send('kancolle-command-actions', { type: 'getSeed' });
  },
};
</script>

<style>
  * {
    box-sizing: border-box;
    user-select: none;
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
    margin: 0;
  }

  ol, ul {
    margin: 0;
    -webkit-padding-start: 24px;
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

  .padding-8 {
    padding: 8px;
  }

  .flip-x {
    transform: scaleX(-1);
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
    background-image: url("./assets/bg.jpg");
  }

  .dq-frame {
    position: relative;
    border: 2px solid #fff;
    border-radius: 6px;
    margin: 1px;
    height: 100%;
    background: rgba(0, 0, 0, .54);
    color: #fff;
    box-shadow: 0 0 0 1px #000, 0 0 7px 3px #000 inset;
    text-shadow: 0 1px #000, 1px 0 #000, -1px 0 #000, 0 -1px #000;
  }

  .dq-frame.strong-shadow {
    box-shadow: 0 0 0 1px #000, 0 0 1.2em .5em #000 inset;
  }

  .dq-frame.win {
    border-radius: 0;
    margin: 0;
  }

  .dq-frame.win.max {
    border: 0;
  }

  .dq-frame.toasted {
    border-radius: 6px !important;
    box-shadow: 0 0 0 1px #000, 0 0 7px 3px #000 inset !important;
  }

  .dq-frame-header, .dq-frame-body, .dq-frame-footer {
    position: relative;
  }

  .win > .dq-frame-header {
    border: none;
    -webkit-app-region: drag;
  }

  .dq-frame-body {
    overflow: auto;
  }

  .dq-frame .divider {
    height: 4px;
    width: 100%;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    background-color: #fff;
    flex: none;
  }

  .dq-frame .layout.row > .divider {
    width: 4px;
    height: 100%;
    border-top: none;
    border-bottom: none;
    border-left: 1px solid #000;
    border-right: 1px solid #000;
    background-color: #fff;
  }

  .dq-frame.orange {
    box-shadow: 0 0 0 1px #ff9800, 0 0 7px 3px #ff9800 inset;
    text-shadow: 0 1px #ff9800, 1px 0 #ff9800, -1px 0 #ff9800, 0 -1px #ff9800;
  }

  .dq-frame.orange.strong-shadow {
    box-shadow: 0 0 0 1px #ff9800, 0 0 1.2em .5em #ff9800 inset;
  }

  .dq-frame .page {
    margin: 0 12px;
  }

  .titlebar-btn {
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .titlebar-btn + .titlebar-btn {
    margin-left: 4px;
  }

  .titlebar-btn:hover {
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

  .tab-actions > .text-btn {
    position: relative;
    margin-left: 1.4em;
  }

  .tab-actions > .text-btn:hover:before,
  .tab-actions > .text-btn.active:before {
    position: absolute;
    content: 'play_arrow';
    font-family: 'Material Icons';
    font-size: 20px;
    left: -1em;
  }
</style>
