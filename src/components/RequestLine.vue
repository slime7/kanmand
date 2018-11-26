<template>
  <div>
    <div class="layout-flex flex-row flex-wrap">
      <div class="flex-none req-block" v-for="(req, index) in requests" :key="index">
        <div class="layout-flex flex-column flex-center flex-space-between req-block-content">
          <div class="flex">{{ index + 1 + '.' + req.route.name }}</div>
          <div class="flex">{{ requestStatus(req) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { ipcRenderer } from 'electron'; // eslint-disable-line
import { mapState } from 'vuex';

export default {
  name: 'RequestLine',

  computed: {
    ...mapState(['requests', 'routes']),
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
  },
};
</script>

<style scoped>
  .req-block {
    padding: 10px;
  }

  .req-block-content {
    background-color: #fafafa;
    color: #222;
    border: 1px solid #504137;
    text-shadow: none;
    padding: 10px;
    width: 120px;
    height: 90px;
    text-align: center;
  }

  .req-block-content:hover {
    border-color: #f8b700
  }
</style>
