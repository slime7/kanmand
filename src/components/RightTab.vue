<template>
  <div class="right-tab">
    <div class="dq-frame">
      <div class="dq-frame-body padding-8">
        <v-layout row class="tab-actions">
          <div class="text-btn" v-on:click="poidataRefresh">
            <v-icon
              dark
              size="20"
              v-show="!tcpLoading && !pluginInstalled"
            >
              close
            </v-icon>
            <v-icon
              dark
              size="20"
              v-show="!tcpLoading && pluginInstalled"
            >
              check
            </v-icon>
            <v-progress-circular
              :size="18"
              color="primary"
              indeterminate
              v-show="tcpLoading"
            ></v-progress-circular>
            <span>poi ghost</span>
          </div>
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
import { ipcRenderer } from 'electron';
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
    ...mapState(['poidata', 'pluginInstalled', 'tcpLoading', 'activeTab']),
  },

  methods: {
    poidataRefresh() {
      [
        'info.ships',
        'info.fleets',
        'info.equips',
        'info.repairs',
      ].forEach((poidataPath) => {
        this.setTcpStatus({ loading: true });
        ipcRenderer.send('kancolle-command-actions', { type: 'poidata', poidataPath });
      });
    },
    switchTab(tab = 'result') {
      this.setActiveTab({ tab });
    },
    ...mapMutations([
      'setTcpStatus',
      'setActiveTab',
    ]),
  },
};
</script>

<style scoped>

</style>
