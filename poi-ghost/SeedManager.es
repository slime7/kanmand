import axios from 'axios';

class SeedManager {
  seeds;

  getting = false;

  gettingSeeds = {
    promise: null,
    resolve: null,
    reject: null,
  };

  getSeeds() {
    if (this.getting) {
      return this.gettingSeeds.promise;
    }

    const sm = this;
    this.gettingSeeds.promise = new Promise((resolve, reject) => {
      sm.gettingSeeds.resolve = resolve;
      sm.gettingSeeds.reject = reject;
    });

    if (!this.seeds) {
      this.getting = true;
      const { getStore } = window;
      const serverIp = getStore('info.server.ip') || '203.104.209.7';
      console.log('start getting seeds.');
      axios.get(`http://${serverIp}/kcs2/js/main.js`)
        .then((response) => {
          const [, seedsString] = /e.PORT_API_SEED=(\[.*?\]),/.exec(response.data);
          sm.seeds = JSON.parse(seedsString);
          console.log({ seeds: sm.seeds });
          sm.gettingSeeds.resolve(sm.seeds);
        })
        .catch((error) => {
          console.warn(`获取 seed 失败: ${error.message}`);
        })
        .then(() => {
          sm.getting = false;
        });
    } else {
      this.gettingSeeds.resolve(this.seeds);
    }

    return this.gettingSeeds.promise;
  }

  async seed(memberId) {
    if (!this.seeds) {
      await this.getSeeds();
    }
    return this.seeds[+memberId % 10];
  }
}

export default SeedManager;
