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

装备打孔栏物品 `/kcsapi/api_req_kaisou/slotset_ex`

| 参数          | 说明    |
| ------------- | ------- |
| `api_id`      | 舰娘 id |
| `api_item_id` | 装备 id |

取消任务 `/kcsapi/api_req_quest/stop`

接任务 `/kcsapi/api_req_quest/start`

完成任务 `/kcsapi/api_req_quest/clearitemget`

| 参数            | 说明                             |
| --------------- | -------------------------------- |
| `api_quest_id`  | 任务 id                          |
| `api_select_no` | （可选）完成任务时选择的奖励序号 |

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
| `api_onslot`   | 补给界面为1，远征界面为0                                   |

修理 `/kcsapi/api_req_nyukyo/start`

| 参数            | 说明              |
| --------------- | ----------------- |
| `api_highspeed` | 是否使用高速修理  |
| `api_ndock_id`  | 修理渠号，从1开始 |
| `api_ship_id`   | 舰娘 id           |

## 技巧

### 在 poi 控制台中获取需要的数据

获取舰队及装备配置字符串

```js
{
  const fleetNum = 0; // 可选 0-3
  const fleet = getStore(`info.fleets[${fleetNum}]`).api_ship.filter(s => s !== -1);
  const ships = getStore('info.ships');
  const kanmand = { version: 1, requests: [] };
  fleet.forEach((shipId, shipIndex) => {
    const ship = ships[shipId];
    kanmand.requests.push({
      ro: 'fleet_change',
      da: `{"api_id":${fleetNum + 1},"api_ship_idx":${shipIndex},"api_ship_id":${shipId}}`,
    });
    if (ship.api_slot.filter(s => s !== -1).length < ship.api_slotnum) {
      kanmand.requests.push({
        ro: 'unsetslot_all',
        da: `{"api_id":${shipId}}`,
      });
    }
    for (let eqi = 0; eqi < ship.api_slotnum; eqi += 1) {
      if (ship.api_slot[eqi] !== -1) {
        kanmand.requests.push({
          ro: 'slotset',
          da: `{"api_id":${shipId},"api_item_id":${ship.api_slot[eqi]},"api_slot_idx":${eqi}}`,
        });
      }
    }
    if (ship.api_slot_ex !== 0) {
      kanmand.requests.push({
        ro: 'slotset_ex',
        da: `{"api_id":${shipId},"api_item_id":${ship.api_slot_ex}}`,
      });
    }
  });
  console.log(btoa(JSON.stringify(kanmand)));
}
```

