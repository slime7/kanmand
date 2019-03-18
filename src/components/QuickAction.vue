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
      <v-layout row class="text-btn poidata-btn" v-on:click="poidataRefresh">
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
          :size="20"
          color="primary"
          style="vertical-align: top;"
          indeterminate
          v-show="tcpLoading"
        ></v-progress-circular>
        <span>poi ghost</span>
      </v-layout>
      <span class="text-btn" v-on:click="savePlugin">下载插件</span>
      <span class="text-btn" v-on:click="devtool">打开控制台</span>
      <v-spacer/>
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
          <div>
            <span class="text-btn" v-on:click="addPortCommand">母港</span>
          </div>
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
                  全补给
                </span>
                <span
                  class="text-btn"
                  v-on:click="addChargeCommand(fleet, 0)"
                >
                  载具补给
                </span>
                <span
                  class="text-btn fleet-export"
                  v-on:click.exact="fleetCopy(index + 1)"
                  v-on:click.ctrl="fleetSaveDialog(index + 1)"
                  v-show="index !== 0"
                >
                  导出
                </span>
                <span
                  class="text-btn fleet-export"
                  v-on:click.exact="fleetCopy(1)"
                  v-on:click.ctrl="fleetSaveDialog(1)"
                  v-on:click.right.exact="fleetCopy(12)"
                  v-on:click.ctrl.right="fleetSaveDialog(12)"
                  v-show="index === 0"
                >
                  导出
                </span>
                <span
                  class="text-btn"
                  v-if="fleet.api_mission[0] !== 0"
                  v-on:click.exact="addMissionCommand(fleet)"
                  v-on:click.right="addMissionCommand(fleet, false)"
                >
                {{missions[index].text}}
              </span>
              </div>
            </li>
          </ol>
        </div>
        <div class="divider"></div>
        <div class="padding-8">
          <v-layout row>
            <div>舰队配置</div>
            <v-spacer/>
            <span class="text-btn" v-on:click="openFleetsDir">打开保存目录</span>
          </v-layout>
          <ol>
            <li
              v-for="(fleet, index) in savedFleet"
              :key="index"
            >
              <v-layout row align-center>
                <div
                  class="fleet-desc text-btn"
                  v-on:click="exportFleetMenu($event, fleet)"
                >
                  {{ fleet.replace(/.json/i, '') }}
                </div>
              </v-layout>
            </li>
          </ol>
          <div v-show="!savedFleet.length">暂无记录</div>
        </div>
      </v-flex>
    </v-layout>
    <v-menu
      v-model="showExportFleetMenu"
      :position-x="exportFleetMenuPosition.x"
      :position-y="exportFleetMenuPosition.y"
      absolute
      offset-y
    >
      <div class="dq-frame padding-8">
        <div class="dq-frame-body">
          <v-layout column>
            <div
              class="switch text-btn"
              v-for="f in [1, 2, 3, 4]"
              v-on:click="exportFleet(f)"
              :key="f"
            >配置到舰队{{f}}
            </div>
            <div class="switch text-btn" v-on:click="removeSavedFleet">移除</div>
          </v-layout>
        </div>
      </div>
    </v-menu>
    <v-dialog
      v-model="showSaveFleetDialog"
      attach="#app .main-container"
      persistent
      max-width="300"
    >
      <div class="dq-frame padding-8 modal">
        <v-layout column class="dq-frame-body">
          <div>舰队配置描述</div>
          <v-layout row>
            <input
              class="flex"
              placeholder="如：2-5水反"
              v-model="fleetDesc"
            />
          </v-layout>
          <v-layout row>
            <v-spacer/>
            <span class="text-btn" v-on:click="fleetSaveDialog(null, false)">取消</span>
            <span class="text-btn" v-on:click="fleetSave">保存</span>
          </v-layout>
          <v-spacer/>
        </v-layout>
      </div>
    </v-dialog>
  </v-layout>
</template>

<script>
/* global __static */
import { ipcRenderer, clipboard } from 'electron';
import { mapState, mapGetters, mapMutations } from 'vuex';
import { getPortId } from '../utils';

export default {
  name: 'QuickAction',

  data() {
    return {
      pluginDir: `${__static}`,
      missions: [
        { text: '', timeoutId: null },
        { text: '', timeoutId: null },
        { text: '', timeoutId: null },
        { text: '', timeoutId: null },
      ],
      showSaveFleetDialog: false,
      fleetNum: null,
      fleetDesc: '',
      showExportFleetMenu: false,
      exportFleetMenuPosition: { x: 0, y: 0 },
      exportFleetMenuSelected: null,
    };
  },

  computed: {
    ...mapGetters(['repairShip']),
    ...mapState([
      'requests',
      'routes',
      'gameLinkStored',
      'poidata',
      'pluginInstalled',
      'tcpLoading',
      'memberid',
      'gameSeed',
      'savedFleet',
    ]),
  },

  watch: {
    poidata() {
      if (this.poidata.info.fleets) {
        this.poidata.info.fleets.forEach((fleet, index) => {
          const missionText = this.formatFleetMission(fleet);
          this.missions[index].text = missionText;
          if (this.missions[index].timeoutId) {
            clearInterval(this.missions[index].timeoutId);
            this.missions[index].timeoutId = null;
          }
          if (missionText !== '') {
            const self = this;
            this.missions[index].timeoutId = setInterval(() => {
              self.missions[index].text = self.formatFleetMission(fleet);
            }, 500);
          }
        });
      }
      if (this.poidata.info.basic) {
        const memberid = this.poidata.info.basic.api_member_id;
        if (this.memberid !== memberid) {
          this.setMemberid({ memberid });
          ipcRenderer.send('kancolle-command-actions', {
            type: 'setting',
            settingKey: 'kanmand.memberid',
            settingValue: memberid,
          });
        }
      }
    },
  },

  methods: {
    poidataRefresh() {
      const dataPath = [
        'info.ships',
        'info.fleets',
        'info.equips',
        'info.repairs',
        'info.basic',
      ];
      if (!Object.keys(this.poidata.const.$ships).length) {
        dataPath.push('const.$ships');
      }
      this.setTcpStatus({ loading: true });
      ipcRenderer.send('kancolle-command-actions', { type: 'poidata', poidataPath: dataPath });
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
        let missionCode;
        if (+fleet.api_mission[1] > 100) {
          switch (+fleet.api_mission[1]) {
            case 100:
              missionCode = 'A1';
              break;
            case 101:
              missionCode = 'A2';
              break;
            case 102:
              missionCode = 'A3';
              break;
            case 110:
              missionCode = 'B1';
              break;
            case 111:
              missionCode = 'B2';
              break;
            case 301:
              missionCode = 'S1';
              break;
            case 302:
              missionCode = 'S2';
              break;
            default:
              missionCode = '??';
              break;
          }
        } else {
          [, missionCode] = fleet.api_mission;
        }
        const missionNum = `00${missionCode}`.substr(-2);
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
    addMissionCommand(fleet, charge = true) {
      const completeLeftSecond = Math.round((fleet.api_mission[2] - new Date().getTime()) / 1000);
      if (completeLeftSecond < 59) {
        const hasPortCommand = this.requests.filter(r => r.route.name === 'port');
        if (!hasPortCommand.length) {
          this.addPortCommand();
        }
        this.addCommand('mission_result', {
          api_deck_id: fleet.api_id,
        });
        if (charge) {
          this.addCommand('charge', {
            api_kind: 3,
            api_id_items: fleet.api_ship.filter(s => s !== -1).join(','),
            api_onslot: 1,
          });
        }
      } else {
        this.$toasted.show('远征还没回来');
      }
    },
    addChargeCommand(fleet, type) {
      // type 1: 油, 2: 弹, 3: 全, 0: 铝
      const shipStat = [];
      fleet.api_ship.filter(s => s !== -1).forEach((shipId) => {
        const ship = this.poidata.info.ships[shipId];
        const shipStd = this.poidata.const.$ships[ship.api_ship_id];
        const allEquips = this.poidata.info.equips;
        const getShipEquipedId = () => {
          const equipIds = [];
          ship.api_slot.forEach((equip) => {
            if (equip > 0) {
              equipIds.push(allEquips[equip].api_slotitem_id);
            } else {
              equipIds.push(equip);
            }
          });
          return equipIds;
        };
        const planeCheck = () => {
          const nowSlot = ship.api_onslot;
          const maxSlot = shipStd.api_maxeq;
          const equips = getShipEquipedId();
          let res = true;
          maxSlot.forEach((c, i) => {
            if (c !== nowSlot[i] && equips[i] !== 138 && equips[i] !== 178) {
              res = false;
            }
          });
          return res;
        };
        shipStat.push({
          shipId,
          bull: [ship.api_bull, shipStd.api_bull_max],
          fuel: [ship.api_fuel, shipStd.api_fuel_max],
          lostPlane: !planeCheck(),
        });
      });

      if (type !== 9) {
        const needCharge = [];
        shipStat.forEach((ship) => {
          if (((type === 2 || type === 3) && ship.bull[0] < ship.bull[1])
            || ((type === 1 || type === 3) && ship.fuel[0] < ship.fuel[1])
            || ((type === 0 || type === 3) && ship.lostPlane)) {
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
          if (ship.lostPlane) {
            this.addCommand('charge', {
              api_kind: 0,
              api_id_items: ship.shipId,
              api_onslot: 1,
            });
          }
        });
      }
    },
    addPortCommand() {
      if (this.memberid && this.gameSeed.length) {
        const portId = getPortId(this.memberid, this.gameSeed);
        this.addCommand('port', {
          api_port: portId,
        });
      } else {
        this.$toasted.show('母港操作需要 member id 和 seed');
      }
    },
    fleetExport(fleetNum) {
      const poiBattleStruct = {
        version: 'kanmand',
        fleet: {
          main: [],
          escort: null,
        },
      };
      const poiInfo = this.poidata.info;
      const buildFleet = (id) => {
        const ship = poiInfo.ships[id];
        const shipSlot = ship.api_slot.filter(e => e !== -1).map((equipId) => {
          const equip = poiInfo.equips[equipId];
          return equip;
        });
        const shipSlotEx = ship.api_slot_ex > 0
          ? this.poidata.info.equips[ship.api_slot_ex]
          : null;
        const poiShip = {
          api_id: id,
          api_ship_id: ship.api_ship_id,
          api_slotnum: ship.api_slotnum,
          poi_slot: shipSlot,
          poi_slot_ex: shipSlotEx,
        };
        return poiShip;
      };
      let fleetMain;
      let fleetEscort;
      if (fleetNum === 12) {
        [fleetMain] = poiInfo.fleets;
        [, fleetEscort] = poiInfo.fleets;
      } else {
        fleetMain = poiInfo.fleets[fleetNum - 1];
      }
      fleetMain.api_ship.filter(s => s !== -1).forEach((id) => {
        const fleet = buildFleet(id);
        poiBattleStruct.fleet.main.push(fleet);
      });
      if (fleetNum === 12) {
        poiBattleStruct.fleet.escort = [];
        fleetEscort.api_ship.filter(s => s !== -1).forEach((id) => {
          const fleet = buildFleet(id);
          poiBattleStruct.fleet.escort.push(fleet);
        });
      }

      return JSON.stringify(poiBattleStruct);
    },
    fleetCopy(fleetNum) {
      const fleetString = this.fleetExport(fleetNum);
      clipboard.writeText(fleetString);
      this.$toasted.show('已复制到剪切板');
    },
    fleetSave() {
      if (!this.fleetNum) {
        return;
      }
      const fleetDesc = this.fleetDesc.trim();
      if (fleetDesc === '') {
        this.$toasted.show('描述不能为空');
        return;
      }
      const fleetDescVaild = /[\\:"<>?/]+/.test(fleetDesc);
      if (fleetDescVaild) {
        this.$toasted.show('描述不能包含以下字符：\\ : " < > ? /');
        return;
      }
      const fleetString = this.fleetExport(this.fleetNum);
      ipcRenderer.send('kancolle-command-actions', {
        type: 'saveFleet',
        fleetString,
        fleetDesc,
      });
      this.showSaveFleetDialog = false;
      this.fleetNum = null;
    },
    fleetSaveDialog(fleetNum, isOpen = true) {
      if (isOpen) {
        this.fleetNum = fleetNum;
        this.showSaveFleetDialog = true;
      } else {
        this.fleetNum = null;
        this.showSaveFleetDialog = false;
      }
    },
    exportFleetMenu(ev, fleet) {
      ev.preventDefault();
      this.exportFleetMenuPosition.x = ev.clientX - ev.offsetX;
      this.exportFleetMenuPosition.y = ev.clientY - ev.offsetY + ev.target.clientHeight + 4;
      this.showExportFleetMenu = true;
      this.exportFleetMenuSelected = fleet;
    },
    exportFleet(target) {
      ipcRenderer.send('kancolle-command-actions', {
        type: 'loadFleet',
        fleetDesc: this.exportFleetMenuSelected,
        fleetTarget: target,
      });
    },
    removeSavedFleet() {
      ipcRenderer.send('kancolle-command-actions', {
        type: 'removeFleet',
        fleetDesc: this.exportFleetMenuSelected,
      });
    },
    savePlugin() {
      ipcRenderer.send('kancolle-command-actions', {
        type: 'saveplugin',
        pluginDir: this.pluginDir,
      });
    },
    devtool() {
      ipcRenderer.send('kancolle-command-actions', { type: 'devtool' });
    },
    openFleetsDir() {
      ipcRenderer.send('kancolle-command-actions', { type: 'openFleetsDir' });
    },
    ...mapMutations([
      'setTcpStatus',
      'setMemberid',
    ]),
  },

  mounted() {
    ipcRenderer.send('kancolle-command-actions', { type: 'savedFleet' });
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
  .ship-hp,
  .fleet-desc {
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

  .fleet-desc {
    width: 100%;
  }

  .ship-level {
    width: 45px;
  }

  .poidata-btn {
    flex: none;
  }

  .dq-frame.modal {
    background: black;
  }

  .switch {
    position: relative;
    margin-left: 1.4em;
    min-width: 40px;
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
