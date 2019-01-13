<template>
  <v-layout column class="dq-frame main">
    <div class="dq-frame-header padding-8">
      <v-layout row>
        <div>快捷操作</div>
        <v-spacer/>
      </v-layout>
    </div>
    <div class="divider"></div>
    <v-layout row class="padding-8">
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
          :size="16"
          color="primary"
          indeterminate
          v-show="tcpLoading"
        ></v-progress-circular>
        <span>poi ghost</span>
      </div>
      <span class="text-btn" v-on:click="devtool">打开控制台</span>
    </v-layout>
    <div class="divider"></div>
    <v-layout rolumn fill-height class="flex dq-frame-body">
      <v-flex class="content">
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
              <span class="ship-name">
                {{shipName(ship)}}
              </span>
              <span class="ship-level">lv.{{ship.api_lv}}</span>
              <span class="ship-hp">{{shipHp(ship)}}</span>
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
              <div>
                <span class="fleet-name">{{fleet.api_name}}</span>
                <span
                  class="text-btn"
                  v-on:click.left="addChargeCommand(fleet, 3)"
                  v-on:click.right="addChargeCommand(fleet, 9)"
                >
                  补给
                </span>
                <span
                  class="text-btn"
                  v-on:click="addChargeCommand(fleet, 1)"
                >
                  油
                </span>
                <span
                  class="text-btn"
                  v-on:click="addChargeCommand(fleet, 2)"
                >
                  弹
                </span>
                <span class="text-btn fleet-export" v-show="0">保存</span>
                <span
                  class="text-btn"
                  v-if="fleet.api_mission[0] !== 0"
                  v-on:click="addMissionCommand(fleet)"
                >
                {{formatFleetMission(fleet)}}
              </span>
              </div>
            </li>
          </ol>
        </div>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'QuickAction',

  data() {
    return {};
  },

  computed: {
    ...mapGetters(['repairShip']),
    ...mapState(['routes', 'gameLinkStored', 'poidata', 'pluginInstalled', 'tcpLoading']),
  },

  methods: {
    poidataRefresh() {
      const dataPath = [
        'info.ships',
        'info.fleets',
        'info.equips',
        'info.repairs',
      ];
      if (!(this.poidata.const && this.poidata.const.$ships)) {
        dataPath.push('const.$ships');
      }
      dataPath.forEach((poidataPath) => {
        this.setTcpStatus({ loading: true });
        ipcRenderer.send('kancolle-command-actions', { type: 'poidata', poidataPath });
      });
    },
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
    shipHp(ship) {
      const shipHpPercent = `${Math.round(ship.api_nowhp / ship.api_maxhp * 100)}%`;
      return `${shipHpPercent} (${ship.api_nowhp} / ${ship.api_maxhp})`;
    },
    shipName(ship, fleetPrefix = true) {
      let fleetNum;
      this.poidata.info.fleets.forEach((fleet) => {
        if (fleetPrefix && fleet.api_ship.indexOf(ship.api_id) >= 0) {
          fleetNum = fleet.api_id;
        }
      });
      const shipname = this.poidata.const.$ships[ship.api_ship_id].api_name;
      return `${fleetNum ? `/${fleetNum} ` : ''}${shipname}`;
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
      if (fleet.api_mission[0] === 2) {
        this.addCommand('mission_result', {
          api_deck_id: fleet.api_id,
        });
      } else {
        this.$toasted.show('远征还没回来');
      }
    },
    addChargeCommand(fleet, type) {
      // type 1: 油, 2: 弹, 3: 全
      const shipStat = [];
      fleet.api_ship.filter(s => s !== -1).forEach((shipId) => {
        const ship = this.poidata.info.ships[shipId];
        const shipStd = this.poidata.const.$ships[ship.api_ship_id];
        shipStat.push({
          shipId,
          bull: [ship.api_bull, shipStd.api_bull_max],
          fuel: [ship.api_fuel, shipStd.api_fuel_max],
        });
      });

      if (type !== 9) {
        const needCharge = [];
        shipStat.forEach((ship) => {
          if ((type !== 1 && ship.bull[0] < ship.bull[1])
            || (type !== 2 && ship.fuel[0] < ship.fuel[1])) {
            needCharge.push(ship.shipId);
          }
        });
        if (needCharge.length) {
          this.addCommand('charge', {
            api_kind: type,
            api_id_items: needCharge.join(','),
            api_onslot: 1,
          });
        }
      } else {
        shipStat.forEach((ship) => {
          if (ship.fuel[0] < ship.fuel[1]) {
            this.addCommand('charge', {
              api_kind: 1,
              api_id_items: ship.shipId,
              api_onslot: 1,
            });
          }
          if (ship.bull[0] < ship.bull[1]) {
            this.addCommand('charge', {
              api_kind: 2,
              api_id_items: ship.shipId,
              api_onslot: 1,
            });
          }
        });
      }
    },
    devtool() {
      ipcRenderer.send('kancolle-command-actions', { type: 'devtool' });
    },
    ...mapMutations([
      'setTcpStatus',
    ]),
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

  .fleet-name,
  .ship-name,
  .ship-level,
  .ship-hp {
    display: inline-block;
    vertical-align: top;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
  }

  .fleet-name, .ship-name {
    width: 100px;
  }

  .ship-level {
    width: 45px;
  }
</style>
