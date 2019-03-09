<template>
  <v-layout column shrink class="flex padding-8">
    <v-layout row wrap class="flex req-wrap">
      <v-flex shrink class="req-block" v-for="(req, index) in requests" :key="index">
        <div class="dq-frame padding-8" :class="{orange: selected === index}"
             v-on:click="selectEditingRequest(index)">
          <v-layout column class="dq-frame-body">
            <v-flex shrink>{{ index + 1 + '.' + req.route.name }}</v-flex>
            <v-flex shrink class="flex-none">
              <v-icon
                dark
                v-show="!requestStatus.processing || index"
              >
                {{ requestIcon(req) }}
              </v-icon>
              <v-progress-circular
                :size="24"
                color="primary"
                indeterminate
                v-show="requestStatus.processing && !index"
              ></v-progress-circular>
            </v-flex>
            <v-spacer/>
            <v-flex shrink class="req-actions" v-show="!requestStatus.processing">
              <v-layout row justify-space-between>
                <div class="text-btn" v-on:click.stop="moveCommand(index, -1)">
                  <v-icon dark size="20">arrow_back</v-icon>
                </div>
                <div class="text-btn" v-on:click.stop="removeCommand(index)">删除</div>
                <div class="text-btn" v-on:click.stop="moveCommand(index, 1)">
                  <v-icon dark size="20">arrow_forward</v-icon>
                </div>
              </v-layout>
            </v-flex>
          </v-layout>
        </div>
      </v-flex>
      <v-flex shrink class="req-block">
        <div class="dq-frame padding-8" :class="{orange: selected === null}"
             v-on:click="selectEditingRequest(null)">
          <v-layout column class="dq-frame-body">
            <div>NEW</div>
            <div>
              <v-icon dark>add</v-icon>
            </div>
            <v-spacer/>
            <div class="req-actions">
              <span class="text-btn" v-on:click.stop="exportCommand">导出</span>
            </div>
          </v-layout>
        </div>
      </v-flex>

      <v-flex shrink class="req-block" v-for="(req, index) in lastRequests" :key="'lr' + index">
        <div class="dq-frame padding-8">
          <v-layout column class="dq-frame-body">
            <div>{{ index + 1 + '.' + req.route.name }}</div>
            <div>
              <v-icon dark>{{ requestIcon(req) }}</v-icon>
            </div>
            <v-spacer/>
          </v-layout>
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'RequestLine',

  computed: {
    ...mapState([
      'requests',
      'lastRequests',
      'routes',
      'selected',
      'requestStatus',
    ]),
  },

  methods: {
    requestIcon(req) {
      let ret;
      if (!req.error && !req.response) {
        ret = 'flag';
      } else if (req.error) {
        ret = 'close';
      } else if (req.responseData.api_result !== 1) {
        ret = 'report_problem';
      } else {
        ret = 'done';
      }
      return ret;
    },
    removeCommand(reqInd) {
      ipcRenderer.send('kancolle-command-actions', { type: 'remove', reqInd });
    },
    moveCommand(reqInd, direction) {
      if (reqInd + direction < 0 || reqInd + direction >= this.requests.length) {
        return;
      }
      ipcRenderer.send('kancolle-command-actions', { type: 'move', reqInd, direction });
    },
    exportCommand() {
      if (!this.requests.length) {
        return;
      }
      const req = { version: 1, requests: [] };
      this.requests.forEach((r) => {
        req.requests.push({ ro: r.route.name, da: r.data });
      });
      clipboard.writeText(btoa(JSON.stringify(req)));
      this.$toasted.show('已复制到剪切板');
    },
    ...mapMutations(['selectEditingRequest']),
  },
};
</script>

<style scoped>
  .req-wrap {
    overflow: scroll;
  }

  .req-block {
    padding: 2px;
  }

  .req-block .dq-frame {
    width: 120px;
    height: 90px;
  }

  .dq-frame-body {
    height: 100%;
  }
</style>
