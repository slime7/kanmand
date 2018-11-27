<template>
  <div>
    <div class="layout-flex flex-row flex-wrap">
      <div class="flex-none req-block" v-for="(req, index) in requests" :key="index">
        <div class="dq-frame" :class="{orange: selected === index}"
             v-on:click="selectEditingRequest(index)">
          <div class="layout-flex flex-column dq-frame-body">
            <div class="flex-none">{{ index + 1 + '.' + req.route.name }}</div>
            <div class="flex-none">{{ requestStatus(req) }}</div>
            <div class="flex"></div>
            <div class="req-actions flex-none layout-flex flex-row flex-space-between">
              <div class="text-btn" v-on:click.stop="moveCommand(index, -1)">⬅</div>
              <div class="text-btn" v-on:click.stop="removeCommand(index)">删除</div>
              <div class="text-btn" v-on:click.stop="moveCommand(index, 1)">➡</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-none req-block">
        <div class="dq-frame" :class="{orange: selected === null}"
             v-on:click="selectEditingRequest(null)">
          <div class="layout-flex flex-column dq-frame-body">
            <div class="flex-none">NEW</div>
            <div class="flex-none">➕</div>
          </div>
        </div>
      </div>

      <div class="flex-none req-block" v-for="(req, index) in lastRequests" :key="index">
        <div class="dq-frame">
          <div class="layout-flex flex-column dq-frame-body">
            <div class="flex-none">{{ index + 1 + '.' + req.route.name }}</div>
            <div class="flex-none">{{ requestStatus(req) }}</div>
            <div class="flex"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'RequestLine',

  computed: {
    ...mapState(['requests', 'lastRequests', 'routes', 'selected']),
  },

  methods: {
    requestStatus(req) {
      let ret;
      if (!req.error && !req.response) {
        ret = '◯';
      } else if (req.error) {
        ret = '✘';
      } else if (!req.responseData.api_result) {
        ret = '✗';
      } else {
        ret = '✔';
      }
      return ret;
    },
    removeCommand(reqInd) {
      ipcRenderer.send('kancolle-command-remove-data', reqInd);
    },
    moveCommand(reqInd, direction) {
      if (reqInd + direction < 0 || reqInd + direction >= this.requests.length) {
        return;
      }
      ipcRenderer.send('kancolle-command-move-data', { reqInd, direction });
    },
    ...mapMutations(['selectEditingRequest']),
  },
};
</script>

<style scoped>
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
