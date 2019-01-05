<template>
  <v-layout column class="dq-frame result-main" v-show="lastRequests.length">
    <div class="dq-frame-body">
      <v-layout row>
        <div class="result-content">
          <div>
            {{
            lastRequests[resultIndex] ?
            `${resultIndex + 1}.${lastRequests[resultIndex].route.name}
            (${lastRequests[resultIndex].route.path})`
            : '-'
            }}
          </div>
          <div>
            result: {{
            lastRequests[resultIndex] && !lastRequests[resultIndex].error ?
            lastRequests[resultIndex].responseData.api_result : '-'
            }}
          </div>
          <div>
            message: {{
            lastRequests[resultIndex] && !lastRequests[resultIndex].error ?
            lastRequests[resultIndex].responseData.api_result_msg : '-'
            }}
          </div>
          <div>
            data:
            <pre>{{
            lastRequests[resultIndex] && !lastRequests[resultIndex].error ?
            JSON.stringify(lastRequests[resultIndex].responseData.raw_data, null, 2) : '-'
            }}</pre>
          </div>
        </div>
      </v-layout>
    </div>
    <div class="dq-frame-footer">
      <v-layout row justify-space-between class="req-actions">
        <div class="text-btn" v-on:click.stop="nav(-1)">
          <v-icon dark small>arrow_back</v-icon>
        </div>
        <div class="text-btn" v-on:click.stop="nav(1)">
          <v-icon dark small>arrow_forward</v-icon>
        </div>
      </v-layout>
    </div>
  </v-layout>
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
  .result-main, .result-content {
    overflow: scroll;
  }

  .result-content {
    position: relative;
    height: 100%;
  }

  .dq-frame {
    margin: 1px;
  }
</style>
