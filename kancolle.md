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

装备别舰装备 `/kcsapi/api_req_kaisou/slot_deprive`

| 参数                  | 说明                                          |
| --------------------- | --------------------------------------------- |
| `api_unset_idx`       | 卸装舰娘装备序号，0 开始，装备栏为打孔时也为 0  |
| `api_set_slot_kind`   | 装备栏种类，0 为普通，1 为打孔                |
| `api_unset_slot_kind` | 装备栏种类，0 为普通，1 为打孔                |
| `api_unset_ship`      | 需卸装舰娘 id                                 |
| `api_set_idx`         | 需装舰娘装备序号，0 开始，装备栏为打孔时为 -1 |
| `api_set_ship`        | 需装备舰娘 id                                 |

卸除所有装备 `/kcsapi/api_req_kaisou/unsetslot_all`

| 参数     | 说明    |
| -------- | ------- |
| `api_id` | 舰娘 id |

交换装备位置 `/kcsapi/api_req_kaisou/slot_exchange_index`

| 参数          | 说明                  |
| ------------- | --------------------- |
| `api_id`      | 舰娘 id               |
| `api_src_idx` | 移动源位置，从 0 开始 |
| `api_dst_idx` | 移动目标，从 0 开始   |

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
| `api_kind`     | 补给类型<br>`0` 补舰载机<br>`1` 补油<br>`2` 补弹<br>`3` 全补给 |
| `api_id_items` | 舰娘 id ，逗号分隔                                         |
| `api_onslot`   | 补给界面为1，远征界面为0                                   |

修理 `/kcsapi/api_req_nyukyo/start`

| 参数            | 说明              |
| --------------- | ----------------- |
| `api_highspeed` | 是否使用高速修理  |
| `api_ndock_id`  | 修理渠号，从1开始 |
| `api_ship_id`   | 舰娘 id           |

开发装备 `/kcsapi/api_req_kousyou/createitem`

| 参数        | 说明 |
| ----------- | ---- |
| `api_item1` | 油   |
| `api_item2` | 弹   |
| `api_item3` | 钢   |
| `api_item4` | 铝   |

母港 `/kcsapi/api_port/port`

| 参数             | 说明 |
| ---------------- | ---- |
| `api_sort_key`   | 5 |
| `spi_sort_order` | 2 |
| `api_port`   | 母港动态 id |



## 技巧

### 代理

代理可以用来让请求走你设定的服务器，不过 kancolle 并不需要像 DMM 那样需要伪装自己的国家才能玩。你可以把代理设置为 poi、航海日志、MyFleetGirls 等记录工具的代理地址，让它们记录你发送的数据。

### 在 poi 控制台中获取需要的数据

获取舰队及装备配置字符串

```js
{
  const fleetNum = 0; // 读取舰队，可选 0-3
  const targetFleet = 0; // 展开舰队，可选 0-3
  const fleet = getStore(`info.fleets[${fleetNum}]`).api_ship.filter(s => s !== -1);
  const ships = getStore('info.ships');
  const kanmand = { version: 1, requests: [] };
  fleet.forEach((shipId, shipIndex) => {
    const ship = ships[shipId];
    kanmand.requests.push({
      ro: 'fleet_change',
      da: `{"api_id":${targetFleet + 1},"api_ship_idx":${shipIndex},"api_ship_id":${shipId}}`,
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

