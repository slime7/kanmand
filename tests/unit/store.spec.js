import { storeConfig } from '@/store';
import poidata from '@/../mocks/poidataMock.json';

describe('vuex store getters', () => {
  it('返回80%血量以下的船', () => {
    const state = {
      repairFilter: {
        hp: 80,
        infleet: false,
      },
      activeTab: 'quickaction',
      poidata,
    };
    expect(storeConfig.getters.repairShip(state).length).toBe(4);
  });
  it('返回99%血量以下的船', () => {
    const state = {
      repairFilter: {
        hp: 99,
        infleet: false,
      },
      activeTab: 'quickaction',
      poidata,
    };
    expect(storeConfig.getters.repairShip(state).length).toBe(6);
  });
  it('只返回80%血量以下在舰队中的船', () => {
    const state = {
      repairFilter: {
        hp: 80,
        infleet: true,
      },
      activeTab: 'quickaction',
      poidata,
    };
    state.poidata.info.fleets[0].api_ship = [58];
    expect(storeConfig.getters.repairShip(state).length).toBe(1);
  });
});
