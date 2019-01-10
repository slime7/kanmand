function createSerialId(memberId, x, y) {
  // 828,318 751,439
  const PORT_API_SEED = [4581, 3094, 2263, 3872, 8100, 3701, 5947, 6929, 3185, 7753];
  const n = (new Date()).getTime();
  const r = Math.floor(n / 1000);
  const xf = (Math.round(x) % 1000) + 1000;
  const yf = (Math.round(y) % 1000) + 1000;
  let s = 10000 * xf + yf;
  s *= PORT_API_SEED[memberId % 10];
  return r.toString() + s.toString();
}

/* global getStore */
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

{
  const needCharge = getStore('info.ships');
}
