<template>
  <v-layout column class="dq-frame result-main">
    <div class="dq-frame-header padding-8">
      <v-layout row class="req-actions">
        <div>结果</div>
        <v-spacer/>
        <div class="text-btn flip-x" v-show="lastRequests.length" v-on:click.stop="nav(-1)">
          <v-icon dark size="20">play_arrow</v-icon>
        </div>
        <div class="page" v-show="lastRequests.length">
          {{ resultIndex + 1 }} / {{ lastRequests.length }}
        </div>
        <div class="text-btn" v-show="lastRequests.length" v-on:click.stop="nav(1)">
          <v-icon dark size="20">play_arrow</v-icon>
        </div>
      </v-layout>
    </div>
    <div class="divider"></div>
    <v-layout rolumn fill-height class="flex dq-frame-body padding-8">
      <v-flex class="result-content">
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
      </v-flex>
    </v-layout>
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
