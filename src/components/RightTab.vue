<template>
  <div class="right-tab">
    <div class="dq-frame">
      <div class="dq-frame-body padding-8">
        <v-layout row class="tab-actions">
          <div class="text-btn">poi ghost</div>
          <div class="text-btn">result</div>
          <div class="text-btn active" v-on:click="poidatatest">test</div>
        </v-layout>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  name: 'RightTab',

  methods: {
    poidatatest() {
      ipcRenderer.send('kancolle-command-actions', {
        type: 'poidata',
        poidataPath: 'info.fleets',
      });
    },
  },
};
</script>

<style scoped>

</style>
