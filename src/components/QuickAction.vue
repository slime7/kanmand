<template>
  <v-layout column class="dq-frame main">
    <div class="dq-frame-header padding-8">
      <v-layout row>
        <div>快捷操作</div>
        <v-spacer/>
        <div class="text-btn" v-on:click="devtool">控制台</div>
      </v-layout>
    </div>
    <div class="divider"></div>
    <v-layout rolumn fill-height class="flex dq-frame-body">
      <v-flex class="content">
        <v-layout row>
          <div class="padding-8">导出舰队</div>
          <div class="padding-8">
            <span class="text-btn">1</span>
          </div>
          <div class="padding-8">
            <span class="text-btn">2</span>
          </div>
          <div class="padding-8">
            <span class="text-btn">3</span>
          </div>
          <div class="padding-8">
            <span class="text-btn">4</span>
          </div>
        </v-layout>
        <div class="divider"></div>
        <div class="padding-8">
          <div>快速修理</div>
          <ol>
            <li
              v-for="ship in repairShip"
              :key="ship.api_id"
            >
            <span
              class="text-btn"
              v-on:click="addRepairCommand(ship.api_id)"
            >
              {{formatRepairShip(ship)}}
            </span>
            </li>
          </ol>
          <div v-if="!repairShip.length">
            无需要修理的舰娘
          </div>
        </div>
        <div class="divider"></div>
        <div class="padding-8" v-if="poidata.info">
          <div>舰队管理</div>
          <ol>
            <li
              v-for="(fleet, index) in poidata.info.fleets"
              :key="index"
            >
              <span>{{fleet.api_name}}</span>
              <span
                class="text-btn"
                v-if="fleet.api_mission[0] !== 0"
                v-on:click="addMissionCommand(fleet)"
              >
                {{formatFleetMission(fleet)}}
              </span>
            </li>
          </ol>
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
    return {};
  },

  computed: {
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
    formatFleetMission(fleet) {
      let missionText = '';
      if (fleet.api_mission[0] !== 0) {
        const missionNum = `00${fleet.api_mission[1]}`.substr(-2);
        const completeLeftSecond = Math.round((fleet.api_mission[2] - new Date().getTime()) / 1000);
        const completeLeft = completeLeftSecond > 0 ? [
          `00${Math.floor(completeLeftSecond / 3600)}`.substr(-2),
          `00${Math.floor((completeLeftSecond % 3600) / 60)}`.substr(-2),
          `00${Math.floor(completeLeftSecond % 60)}`.substr(-2),
        ] : ['00', '00', '00'];
        missionText = `远征 ${missionNum} (${completeLeft.join(':')})`;
      }
      return missionText;
    },
    addMissionCommand(fleet) {
      const completeLeftSecond = Math.round((fleet.api_mission[2] - new Date().getTime()) / 1000);
      if (completeLeftSecond < 50) {
        this.addCommand('mission_result', {
          api_deck_id: fleet.api_id,
        });
      } else {
        this.$toasted.show('远征还没回来');
      }
    },
    devtool() {
      ipcRenderer.send('kancolle-command-actions', { type: 'devtool' });
    },
  },

  mounted() {
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

  .divider.v {
    margin: -8px 4px;
  }
</style>
