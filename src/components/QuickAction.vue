<template>
  <v-layout column class="dq-frame main">
    <div class="dq-frame-header padding-8">
      <v-layout row>
        <div>快捷操作</div>
        <v-spacer/>
      </v-layout>
    </div>
    <div class="divider"></div>
    <v-layout rolumn fill-height class="flex dq-frame-body padding-8">
      <v-flex class="content">
        <div>
          <h3>快速修理</h3>
          <div
            class="text-btn"
            v-for="ship in repairShip"
            :key="ship.api_id"
            v-on:click="addRepairCommand(ship.api_id)"
          >
            {{formatRepairShip(ship)}}
          </div>
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'QuickAction',

  data() {
    return {
      // repairShip: [],
    };
  },

  computed: {
    // repairShip() {
    //   return this.searchRepairShip();
    // },
    ...mapGetters(['repairShip']),
    ...mapState(['routes', 'gameLinkStored', 'poidata']),
  },

  methods: {
    addCommand(route, data) {
      const [gameRoute] = this.routes.filter(r => r.name === route);
      const gameData = Object.assign(JSON.parse(gameRoute.defaultData), data);
      const reqData = {
        gameLink: this.gameLinkStored,
        gameRoute,
        gameData: JSON.stringify(gameData),
      };
      ipcRenderer.send('kancolle-command-actions', { type: 'add', reqData });
    },
    formatRepairShip(ship) {
      const shipName = this.poidata.const.$ships[ship.api_ship_id].api_name;
      const shipHpPercent = `${Math.round(ship.api_nowhp / ship.api_maxhp * 100)}%`;
      return `${shipName} lv.${ship.api_lv} \
      (${ship.api_nowhp} / ${ship.api_maxhp} | ${shipHpPercent})`;
    },
    addRepairCommand(shipId) {
      const { repairs } = this.poidata.info;
      const [repairSlot] = repairs.filter(r => r.api_state === 0);
      if (repairSlot) {
        this.addCommand('repair_start', {
          api_highspeed: 1,
          api_ndock_id: repairSlot.api_id,
          api_ship_id: shipId,
        });
      } else {
        this.$toasted.show('修理渠满了');
      }
    },
  },

  mounted() {
    // this.searchRepairShip();
  },
};
</script>

<style scoped>
  .main, .content {
    overflow: scroll;
  }

  .content {
    position: relative;
    height: 100%;
  }
</style>
