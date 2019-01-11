<template>
  <div class="right-tab">
    <div class="dq-frame">
      <div class="dq-frame-body padding-8">
        <v-layout row class="tab-actions">
          <div
            v-for="(tab, index) in tabs"
            :key="index"
            class="text-btn"
            :class="{active: activeTab === tab.id}"
            v-on:click="switchTab(tab.id)"
          >
            {{tab.name}}
          </div>
        </v-layout>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'RightTab',

  data() {
    return {
      tabs: [
        {
          id: 'result',
          name: '结果',
        },
        {
          id: 'quickaction',
          name: '快捷操作',
        },
        {
          id: 'setting',
          name: '设置',
        },
      ],
    };
  },

  computed: {
    ...mapState(['activeTab']),
  },

  methods: {
    switchTab(tab = 'result') {
      this.setActiveTab({ tab });
    },
    ...mapMutations([
      'setActiveTab',
    ]),
  },
};
</script>

<style scoped>

</style>
