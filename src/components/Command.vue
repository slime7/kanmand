<template>
  <div class="padding-8">
    <div class="input-area gap-v-8">
      <v-layout row>
        <input class="flex"
               placeholder="游戏链接"
               v-model="gameLink"
               :disabled="!!requests.length"
               v-on:blur="saveGameLink"
        />
      </v-layout>
      <v-layout row>
        <select class="flex" v-model="gameRoute" v-on:change="changeRoute">
          <option disabled value="">发送路径</option>
          <option value="importDataFromString">导入数据</option>
          <option value="importDataFromPoiBattle" v-show="pluginInstalled">
            复制poi战斗数据所用舰队
          </option>
          <option v-for="route in routes"
                  :key="route.name"
                  v-bind:value="route">
            {{ route.hint }}({{ route.path }})
          </option>
        </select>
      </v-layout>
      <v-layout row>
        <textarea class="flex" placeholder="发送数据" rows="5" v-model="gameData"></textarea>
      </v-layout>
    </div>
    <div class="button-group">
      <button class="action-btn" v-on:click="clearCommand">清空队列</button>
      <button class="action-btn" v-on:click="addCommandAction"> 新增</button>
      <button class="action-btn"
              v-on:click="modifyCommand"
              v-show="selected !== null">
        修改
      </button>
      <button class="action-btn" v-on:click="startCommand">执行队列</button>
      <button
        class="action-btn"
        v-on:click="proxyPanel = !proxyPanel"
        :disabled="!!requests.length"
      >
        <span class="proxy-on" v-show="proxy.enabled"></span>
        <span>代理</span>
      </button>
    </div>
    <div class="proxy-panel gap-v-8" v-show="proxyPanel">
      <div>
        <label>
          <input type="checkbox"
                 v-model="proxy.enabled"
                 :disabled="!!requests.length"
                 v-on:change="setProxy">
          <span>启用代理</span>
        </label>
      </div>
      <v-layout row>
        <input class="flex"
               placeholder="代理地址"
               v-model="proxy.host"
               :disabled="!!requests.length"
               v-on:change="setProxy"/>
      </v-layout>
      <v-layout row>
        <input class="flex"
               placeholder="代理端口"
               v-model="proxy.port"
               :disabled="!!requests.length"
               v-on:change="setProxy"/>
      </v-layout>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'Command',

  data() {
    return {
      gameLink: '',
      gameRoute: '',
      gameData: '',
      proxyPanel: false,
      proxy: { enabled: false },
    };
  },

  computed: {
    ...mapState(['requests', 'routes', 'selected', 'poidata', 'pluginInstalled']),
  },

  watch: {
    selected() {
      if (this.requests[this.selected]) {
        ({ route: this.gameRoute, data: this.gameData } = this.requests[this.selected]);
      }
    },
  },

  methods: {
    saveLastReqData() {
      const ls = localStorage;
      ls.setItem('gamelink', this.gameLink);
      ls.setItem('gameroute', this.gameRoute.name);
      ls.setItem('gamereqdata', this.gameData);
    },
    restoreLastReqData() {
      const ls = localStorage;
      const [gl, gr, gd] = [
        ls.getItem('gamelink'),
        ls.getItem('gameroute'),
        ls.getItem('gamereqdata'),
      ];
      if (gl) {
        this.gameLink = gl;
        this.saveGameLink();
      }
      if (gr) {
        [this.gameRoute] = this.routes.filter(r => r.name === gr);
      }
      if (gd) {
        this.gameData = gd;
      }
    },
    addCommandAction() {
      const selectRoute = this.gameRoute;
      if (selectRoute === 'importDataFromString' || selectRoute === 'importDataFromPoiBattle') {
        this.importCommand();
      } else {
        this.addCommand();
      }
    },
    addCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
        this.toasted.show('内容填写不全');
        return;
      }
      const reqData = {
        gameLink: this.gameLink,
        gameRoute: this.gameRoute,
        gameData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-actions', { type: 'add', reqData });
    },
    startCommand() {
      this.clearLastRequests();
      ipcRenderer.send('kancolle-command-actions', { type: 'start' });
    },
    clearCommand() {
      ipcRenderer.send('kancolle-command-actions', { type: 'clear' });
      this.selectEditingRequest(null);
    },
    modifyCommand() {
      if (this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const reqData = {
        gameRoute: this.gameRoute,
        gameData: this.gameData,
      };
      this.saveLastReqData();
      ipcRenderer.send('kancolle-command-actions', {
        type: 'modify',
        reqInd: this.selected,
        reqData,
      });
      this.$toasted.show('修改完成。');
    },
    importCommand() {
      if (this.gameLink === '' || this.gameRoute === '' || this.gameData === '') {
        return;
      }
      const importString = this.gameData;
      const reqData = { gameLink: this.gameLink, importString };
      let type;
      if (this.gameRoute === 'importDataFromString') {
        type = 'import';
      } else if (this.gameRoute === 'importDataFromPoiBattle') {
        // type = 'poifleets';
        type = 'import';
        const poifleetsString = this.parsePoiFleets(importString);
        reqData.importString = poifleetsString;
      } else {
        type = 'import';
      }
      ipcRenderer.send('kancolle-command-actions', { type, reqData });
    },
    changeRoute() {
      if (this.gameRoute !== 'importDataFromString'
        && this.gameRoute !== 'importDataFromPoiBattle') {
        this.gameData = this.gameRoute.defaultData;
      }
    },
    formatShipKanmand(ship, f, i) {
      const k = [];
      const shipId = +ship.api_id;
      const shipStat = this.poidata.info.ships[shipId];
      const fleetStat = this.poidata.info.fleets[f - 1];
      // equipmentStat: 第一项为 exslot ，其余为常规 slot
      const equipmentStat = [
        shipStat.api_slot_ex > 0 ? shipStat.api_slot_ex : null,
        ...shipStat.api_slot.filter(e => e !== -1),
      ];
      if (shipId !== fleetStat.api_ship[i]) {
        // 舰娘
        k.push({
          ro: 'fleet_change',
          da: `{"api_id":${f},"api_ship_idx":${i},"api_ship_id":${shipId}}`,
        });
      }
      // equipment: 第一项为 exslot ，其余为常规 slot
      const equipment = [
        ship.poi_slot_ex ? ship.poi_slot_ex.api_id : null,
        ...this.poislotIds(ship.poi_slot.filter(e => e !== null)),
      ];
      if (JSON.stringify(equipment) !== JSON.stringify(equipmentStat)) {
        if (equipment.slice(1).length < ship.api_slotnum) {
          // 卸下所有装备
          k.push({
            ro: 'unsetslot_all',
            da: `{"api_id":${ship.api_ship_id}}`,
          });
        }
        if (equipment.length) {
          // 装备
          equipment.forEach((eq, eqi) => {
            if (eq) {
              let unsetEqi;
              let unsetKind;
              const [searchEquipedShip] = Object.keys(this.poidata.info.ships)
                .filter((sk) => {
                  const thisShip = this.poidata.info.ships[sk];
                  const ueqi = [thisShip.api_slot_ex, ...thisShip.api_slot].indexOf(eq);
                  if (ueqi >= 0) {
                    unsetKind = ueqi > 0 ? 0 : 1;
                    unsetEqi = ueqi > 0 ? ueqi - 1 : 0;
                  }
                  return +sk !== +shipId && ueqi >= 0;
                });
              if (searchEquipedShip) {
                // 需要的装备被别的舰娘装备
                k.push({
                  ro: 'slot_deprive',
                  da: JSON.stringify(JSON.parse(`\
                    {\
                      "api_unset_idx":${unsetEqi},\
                      "api_set_slot_kind":${eqi === 0 ? 1 : 0},\
                      "api_unset_slot_kind":${unsetKind},\
                      "api_unset_ship":${searchEquipedShip},\
                      "api_set_idx":${eqi - 1},\
                      "api_set_ship":${shipId}\
                    }`)),
                });
                this.shipPreUnset({
                  shipId: searchEquipedShip,
                  equipId: eq,
                  isExSlot: !!unsetKind,
                });
              } else if (eqi === 0 && +shipStat.api_slot_ex !== +eq) {
                // 自己没装备此额外装备
                k.push({
                  ro: 'slotset_ex',
                  da: `{"api_id":${shipId},"api_item_id":${eq}}`,
                });
              } else if (eqi > 0 && +shipStat.api_slot[eqi - 1] !== +eq) {
                // 自己没装备此装备
                k.push({
                  ro: 'slotset',
                  da: `{"api_id":${shipId},"api_item_id":${eq},"api_slot_idx":${eqi - 1}}`,
                });
              }
            }
          });
        }
      }

      return k;
    },
    parsePoiFleets(poiBattleString) {
      let poiBattle;
      try {
        poiBattle = JSON.parse(poiBattleString);
      } catch (err) {
        this.$toasted.show('导入格式不正确');
        return null;
      }
      const kanmandObj = { version: 1, requests: [] };
      const { main, escort } = poiBattle.fleet;
      if (main) {
        main.forEach((ship, si) => {
          const k = this.formatShipKanmand(ship, 1, si);
          kanmandObj.requests.push(...k);
        });
      }
      if (escort) {
        escort.forEach((ship, si) => {
          const k = this.formatShipKanmand(ship, 2, si);
          kanmandObj.requests.push(...k);
        });
      }

      return btoa(JSON.stringify(kanmandObj));
    },
    poislotIds(slot) {
      const ids = [];
      slot.forEach((s) => {
        ids.push(s.api_id);
      });
      return ids;
    },
    setProxy() {
      ipcRenderer.send('kancolle-command-actions', { type: 'proxy', proxySetting: this.proxy });
    },
    getProxy() {
      if (ipcRenderer) {
        ipcRenderer.send('get-proxy-setting');
        ipcRenderer.on('proxy-setting', (event, { proxy }) => {
          this.proxy = proxy;
        });
      }
    },
    saveGameLink() {
      this.setGameLink({ gameLink: this.gameLink });
    },
    ...mapMutations([
      'selectEditingRequest',
      'clearLastRequests',
      'shipPreUnset',
      'setGameLink',
    ]),
  },

  mounted() {
    this.restoreLastReqData();
    this.getProxy();
  },
};
</script>

<style scoped>
  .input-area {
    margin-bottom: 8px;
  }

  .proxy-on {
    display: inline-block;
    vertical-align: top;
    background: center / contain no-repeat url("../assets/key.svg");
    width: 15px;
    height: 15px;
  }
</style>
