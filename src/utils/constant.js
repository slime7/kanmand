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
export const quickQuests = [
  {
    id: 201,
    name: '敵艦隊を撃破せよ！',
    content: '艦隊を出撃させ、敵艦隊を捕捉、これを撃滅せよ！',
    type: '每日/出击',
  },
  {
    id: 216,
    name: '敵艦隊主力を撃滅せよ！',
    content: '艦隊を出撃させ、敵艦隊「主力」を捕捉！これを撃滅せよ！',
    type: '每日/出击',
  },
  {
    id: 210,
    name: '敵艦隊を10回邀撃せよ！',
    content: '艦隊全力出撃！遊弋する敵艦隊を10回邀撃せよ！',
    type: '每日/出击',
  },
  {
    id: 218,
    name: '敵補給艦を3隻撃沈せよ！',
    content: '艦隊を出撃させ、敵補給艦を捕捉、これを撃滅せよ！',
    type: '每日/出击',
  },
  {
    id: 303,
    name: '「演習」で練度向上！',
    content: '本日中に他の司令官の艦隊に対して3回「演習」を挑もう！',
    type: '每日/演习',
  },
  {
    id: 304,
    name: '「演習」で他提督を圧倒せよ！',
    content: '本日中に他の司令官の艦隊との「演習」で5回以上「勝利」をおさめよう！',
    type: '每日/演习',
  },
  {
    id: 402,
    name: '「遠征」を3回成功させよう！',
    content: '本日中に「遠征」を3回成功させよう！',
    type: '每日/远征',
  },
  {
    id: 403,
    name: '「遠征」を10回成功させよう！',
    content: '本日中に「遠征」を10回成功させよう！',
    type: '每日/远征',
  },
  {
    id: 503,
    name: '艦隊大整備！',
    content: '各艦隊から整備が必要な艦を5隻以上ドック入りさせ、大規模な整備をしよう！',
    type: '每日/补给',
  },
  {
    id: 504,
    name: '艦隊酒保祭り！',
    content: '艦隊酒保祭り！各艦に延べ15回以上の補給を実施しよう！',
    type: '每日/补给',
  },
  {
    id: 605,
    name: '新装備「開発」指令',
    content: '「工廠」で装備アイテムを新たに「開発」しよう(失敗もOK)！',
    type: '每日/工厂',
  },
  {
    id: 606,
    name: '新造艦「建造」指令',
    content: '「工廠」で艦娘を本日中に新たに「建造」しよう！',
    type: '每日/工厂',
  },
  {
    id: 607,
    name: '装備「開発」集中強化！',
    content: '「工廠」で装備アイテムを本日中に新たに3回「開発」しよう(失敗もOK)！',
    type: '每日/工厂',
  },
  {
    id: 608,
    name: '艦娘「建造」艦隊強化！',
    content: '艦隊強化のため、「工廠」で艦娘を本日中に新たに3隻「建造」しよう！',
    type: '每日/工厂',
  },
  {
    id: 609,
    name: '軍縮条約対応！',
    content: '少し艦隊規模が大きくなりすぎました！「工廠」で不要な艦を2隻「解体」してください！',
    type: '每日/工厂',
  },
  {
    id: 619,
    name: '装備の改修強化',
    content: '「改修工廠」で「装備」の改修強化に努めます。',
    type: '每日/工厂',
  },
  {
    id: 213,
    name: '海上通商破壊作戦',
    content: '1週間で敵輸送船を20隻以上撃沈せよ！',
    type: '每周/出击',
  },
  {
    id: 214,
    name: 'あ号作戦',
    content: '1週間の全力出撃を行い、可能な限り多くの敵艦隊を捕捉、これを迎撃せよ！',
    type: '每周/出击',
  },
  {
    id: 220,
    name: 'い号作戦',
    content: '有力な母艦航空隊で1週間の全力出撃を行い、可能な限り多くの敵空母を撃滅せよ！',
    type: '每周/出击',
  },
  {
    id: 404,
    name: '大規模遠征作戦、発令！',
    content: '今週中に「遠征」30回成功させよう！',
    type: '每周/远征',
  },
  {
    id: 410,
    name: '南方への輸送作戦を成功させよ！',
    content: '激戦海域である南方海域への「東京急行」系遠征を敢行、これを成功させよ！',
    type: '每周/远征',
  },
  {
    id: 411,
    name: '南方への鼠輸送を継続実施せよ!',
    content: '今週中に「東京急行」系遠征を継続的に実施、同種作戦を7回成功させよう!',
    type: '每周/远征',
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
