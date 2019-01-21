export const exportVersion = 1;
export const routes = [
  {
    name: 'questlist',
    path: '/kcsapi/api_get_member/questlist',
    hint: '获取任务列表',
    defaultData: '{"api_page_no":1,"api_tab_id":0}',
  }, {
    name: 'fleet_change',
    path: '/kcsapi/api_req_hensei/change',
    hint: '更换编成船只',
    defaultData: '{"api_id":1,"api_ship_idx":0,"api_ship_id":1}',
  }, {
    name: 'quest_stop',
    path: '/kcsapi/api_req_quest/stop',
    hint: '取消任务',
    defaultData: '{"api_quest_id":201}',
  }, {
    name: 'quest_start',
    path: '/kcsapi/api_req_quest/start',
    hint: '接任务',
    defaultData: '{"api_quest_id":201}',
  }, {
    name: 'quest_clear',
    path: '/kcsapi/api_req_quest/clearitemget',
    hint: '完成任务',
    defaultData: '{"api_quest_id":201}',
  }, {
    name: 'slotset',
    path: '/kcsapi/api_req_kaisou/slotset',
    hint: '装备物品',
    defaultData: '{"api_id":1,"api_item_id":1,"api_slot_idx":0}',
  }, {
    name: 'slot_deprive',
    path: '/kcsapi/api_req_kaisou/slot_deprive',
    hint: '装备别舰物品',
    defaultData: '{"api_unset_idx":1,"api_set_slot_kind":0,"api_unset_slot_kind":0,"api_unset_ship":1,"api_set_idx":0,"api_set_ship":2}',
  }, {
    name: 'unsetslot_all',
    path: '/kcsapi/api_req_kaisou/unsetslot_all',
    hint: '卸除所有装备',
    defaultData: '{"api_id":1}',
  }, {
    name: 'slotset_ex',
    path: '/kcsapi/api_req_kaisou/slotset_ex',
    hint: '装备打孔栏物品',
    defaultData: '{"api_id":1,"api_item_id":1}',
  }, {
    name: 'mission_result',
    path: '/kcsapi/api_req_mission/result',
    hint: '收远征',
    defaultData: '{"api_deck_id":2}',
  }, {
    /* name: 'mission_start',
     * path: '/kcsapi/api_req_mission/start',
     * hint: '发远征',
     * }, {
     */
    name: 'charge',
    path: '/kcsapi/api_req_hokyu/charge',
    hint: '补给',
    defaultData: '{"api_kind":3,"api_id_items":"1,2","api_onslot":1}',
  }, {
    name: 'repair_start',
    path: '/kcsapi/api_req_nyukyo/start',
    hint: '修理',
    defaultData: '{"api_highspeed":0,"api_ndock_id":1,"api_ship_id":1}',
  }, {
    name: 'createitem',
    path: '/kcsapi/api_req_kousyou/createitem',
    hint: '开发装备',
    defaultData: '{"api_item1":10,"api_item2":10,"api_item3":10,"api_item4":10}',
  }, {
    name: 'port',
    path: '/kcsapi/api_port/port',
    hint: '母港',
    defaultData: '{"api_sort_key":5,"spi_sort_order":2,"api_port":""}',
  },
];
export const defaultSetting = {
  proxy: {
    enabled: false,
    host: '127.0.0.1',
    port: '8080',
  },
  repair: {
    hp: 50,
    infleet: true,
  },
  poidata: {
    refresh: 'timeout',
    timeout: 300000,
  },
};
