## 参数

获取任务列表 `/kcsapi/api_get_member/questlist`

| 参数          | 说明                  |
| ------------- | :-------------------- |
| `api_page_no` | 任务页码              |
| `api_tab_id`  | 任务类型，0表示不筛选 |

更换编成船只 `/kcsapi/api_req_hensei/change`

| 参数           | 说明                       |
| -------------- | :------------------------- |
| `api_id`       | 舰队序号，从1开始          |
| `api_ship_idx` | 舰队中舰娘序号，从0开始    |
| `api_ship_id`  | 更换舰娘 id ，`-1`表示去除 |

装备物品 `/kcsapi/api_req_kaisou/slotset`

| 参数           | 说明                  |
| -------------- | --------------------- |
| `api_id`       | 舰娘 id               |
| `api_item_id`  | 装备 id               |
| `api_slot_idx` | 装备格子序号，从0开始 |

卸除所有装备 `/kcsapi/api_req_kaisou/unsetslot_all`

| 参数     | 说明    |
| -------- | ------- |
| `api_id` | 舰娘 id |

装备物品 `/kcsapi/api_req_kaisou/slotset`

| 参数          | 说明    |
| ------------- | ------- |
| `api_id`      | 舰娘 id |
| `api_item_id` | 装备 id |

取消任务 `/kcsapi/api_req_quest/stop`

接任务 `/kcsapi/api_req_quest/start`

完成任务 `/kcsapi/api_req_quest/clearitemget`

| 参数           | 说明    |
| -------------- | ------- |
| `api_quest_id` | 任务 id |

收远征 `/kcsapi/api_req_mission/result`

| 参数        | 说明                           |
| ----------- | ------------------------------ |
| `api_deck_id` | 从1开始的舰队序号<br>第二舰队为`2` |

发远征 `/kcsapi/api_req_mission/start`

| 参数             | 说明                      |
| ---------------- | ------------------------- |
| `api_mission_id` | 远征 id                   |
| `api_deck_id`    | 进行远征舰队序号，从1开始 |
| `api_mission`    | [0,100]随机整数           |
| `api_serial_cid` | 1543368501 54025305516    |

补给 `/kcsapi/api_req_hokyu/charge`

| 参数           | 说明                                                       |
| -------------- | ---------------------------------------------------------- |
| `api_kind`     | 补给类型<br>`1` 单舰补油<br>`2` 单舰补弹<br>`3` 单舰全补给 |
| `api_id_items` | 舰娘 id ，逗号分隔                                         |
| `api_onslot`   | 不明，总是为1                                              |

修理 `/kcsapi/api_req_nyukyo/start`

| 参数            | 说明              |
| --------------- | ----------------- |
| `api_highspeed` | 是否使用高速修理  |
| `api_ndock_id`  | 修理渠号，从1开始 |
| `api_ship_id`   | 舰娘 id           |

