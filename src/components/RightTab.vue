<template>
  <div class="right-tab">
    <div class="dq-frame">
      <div class="dq-frame-body padding-8">
        <v-layout row class="tab-actions">
          <div class="text-btn" v-on:click="poidataRefresh">
            <v-icon
              dark size="20"
              v-show="!tcpLoading && !pluginInstalled"
            >
              close
            </v-icon>
            <v-icon
              dark size="20"
              v-show="!tcpLoading && pluginInstalled"
            >
              check
            </v-icon>
            <v-progress-circular
              :size="20"
              color="primary"
              indeterminate
              v-show="tcpLoading"
            ></v-progress-circular>
            <span>poi ghost</span>
          </div>
          <div class="text-btn">结果</div>
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

  computed: {
    ...mapState(['poidata', 'pluginInstalled', 'tcpLoading']),
  },

  methods: {
    poidataRefresh() {
      [
        'info.ships',
        'info.fleets',
        'info.equips',
        'info.quests',
      ].forEach((poidataPath) => {
        this.setTcpStatus({ loading: true });
        ipcRenderer.send('kancolle-command-actions', { type: 'poidata', poidataPath });
      });
    },
    ...mapMutations([
      'setTcpStatus',
    ]),
  },
};
</script>

<style scoped>

</style>
