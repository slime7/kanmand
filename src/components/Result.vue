<template>
  <div>
    <div class="dq-frame" v-show="lastRequests.length">
      <div class="layout-flex flex-column dq-frame-body">
        <div class="flex-none">
          <div>
            {{
            lastRequests[resultIndex] ?
            `${lastRequests[resultIndex].route.name}(${lastRequests[resultIndex].route.path})` : '-'
            }}
          </div>
          <div>
            result: {{
            lastRequests[resultIndex] ?
            lastRequests[resultIndex].responseData.api_result : '-'
            }}
          </div>
          <div>
            message: {{
            lastRequests[resultIndex] ?
            lastRequests[resultIndex].responseData.api_result_msg : '-'
            }}
          </div>
          <div>
            data:
            <pre>{{
            lastRequests[resultIndex] ?
            JSON.stringify(lastRequests[resultIndex].responseData.raw_data, null, 2) : '-'
            }}</pre>
          </div>
        </div>
        <div class="flex"></div>
        <div class="req-actions flex-none layout-flex flex-row flex-space-between">
          <div class="text-btn" v-on:click.stop="nav(-1)">⬅</div>
          <div class="text-btn" v-on:click.stop="nav(1)">➡</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Result',

  data() {
    return {
      resultIndex: 0,
    };
  },

  computed: {
    ...mapState(['lastRequests']),
  },

  watch: {
    lastRequests() {
      this.resultIndex = 0;
    },
  },

  methods: {
    nav(d) {
      if (this.resultIndex + d < 0 || this.resultIndex + d >= this.lastRequests.length) {
        return;
      }
      this.resultIndex += d;
    },
  },
};
</script>

<style scoped>

</style>
