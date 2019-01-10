<template>
  <v-layout column class="dq-frame main">
    <div class="dq-frame-header padding-8">
      <v-layout row>
        <div>设置</div>
        <v-spacer/>
      </v-layout>
    </div>
    <div class="divider"></div>
    <v-layout rolumn fill-height class="flex dq-frame-body">
      <v-flex class="content">
        <div class="padding-8">
          <div>修理过滤</div>
          <v-layout row align-center tag="p">
            <div class="setting-title">修理血量</div>
            <div>
              <input
                type="text"
                class="setting-repair-hp"
                v-model="repairFilter.hp"
                v-on:blur="setFilter('hp', repairFilter.hp)"
              >
              <span
                class="text-btn hp-quick-set"
                v-on:click="setFilter('hp', 25)"
              >
                大破
              </span>
              <span
                class="text-btn hp-quick-set"
                v-on:click="setFilter('hp', 50)"
              >
                中破
              </span>
              <span
                class="text-btn hp-quick-set"
                v-on:click="setFilter('hp', 75)"
              >
                小破
              </span>
            </div>
          </v-layout>
          <v-layout row align-center tag="p">
            <div class="setting-title">仅舰队中</div>
            <div
              class="switch text-btn"
              :class="{on: repairFilter.infleet}"
              v-on:click="setFilter('infleet', true)"
            >
              是
            </div>
            <div
              class="switch text-btn"
              :class="{on: !repairFilter.infleet}"
              v-on:click="setFilter('infleet', false)"
            >
              否
            </div>
          </v-layout>
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'Setting',

  computed: {
    ...mapState(['repairFilter']),
  },

  methods: {
    setFilter(field, value) {
      if (field === 'hp' && !(/\d+/.test(+value) && +value >= 0 && +value <= 100)) {
        return;
      }
      const setting = {};
      setting[field] = value;
      this.setRepairFilter(setting);
      ipcRenderer.send('kancolle-command-actions', {
        type: 'setting',
        settingKey: `kanmand.repair.${field}`,
        settingValue: field === 'hp' ? +value : value,
      });
    },
    ...mapMutations(['setRepairFilter']),
  },

  mounted() {
    ipcRenderer.send('kancolle-command-actions', { type: 'setting', settingKey: 'kanmand.repair' });
  },
};
</script>

<style scoped>
  .setting-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
    margin-left: 1.5em;
    width: 120px;
  }

  .setting-repair-hp {
    width: 40px;
  }

  .hp-quick-set {
    margin: 0 4px;
  }

  .switch {
    position: relative;
    margin-left: 1.4em;
    width: 40px;
  }

  .switch:hover:before,
  .switch.on:before {
    position: absolute;
    content: 'play_arrow';
    font-family: 'Material Icons';
    font-size: 20px;
    left: -1em;
  }
</style>
