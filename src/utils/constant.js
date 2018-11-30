export const exportVersion = 1;
export const routes = [
  {
    name: 'questlist',
    path: '/kcsapi/api_get_member/questlist',
    hint: '获取任务列表',
  }, {
    name: 'fleet_change',
    path: '/kcsapi/api_req_hensei/change',
    hint: '更换编成船只',
  }, {
    name: 'quest_stop',
    path: '/kcsapi/api_req_quest/stop',
    hint: '取消任务',
  }, {
    name: 'quest_start',
    path: '/kcsapi/api_req_quest/start',
    hint: '接任务',
  }, {
    name: 'slotset',
    path: '/kcsapi/api_req_kaisou/slotset',
    hint: '装备物品',
  }, {
    name: 'unsetslot_all',
    path: '/kcsapi/api_req_kaisou/unsetslot_all',
    hint: '卸除所有装备',
  }, {
    name: 'slotset_ex',
    path: '/kcsapi/api_req_kaisou/slotset_ex',
    hint: '装备打孔栏物品',
  }, {
    name: 'mission_result',
    path: '/kcsapi/api_req_mission/result',
    hint: '收远征',
  }, {
    /* name: 'mission_start',
     * path: '/kcsapi/api_req_mission/start',
     * hint: '发远征',
     * }, {
     */
    name: 'charge',
    path: '/kcsapi/api_req_hokyu/charge',
    hint: '补给',
  }, {
    name: 'repair_start',
    path: '/kcsapi/api_req_nyukyo/start',
    hint: '修理',
  }, {
    name: 'quest_clear',
    path: '/kcsapi/api_req_quest/clearitemget',
    hint: '完成任务',
  },
];
