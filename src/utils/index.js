export const getPortId = (memberId, seeds) => {
  const seed = seeds[memberId % 10];
  const now = Math.floor(Date.now() / 1000);
  // [1001-1010]+memberId后3位
  const memberIdLast3Random = 1000 * (Math.floor(9 * Math.random()) + 1) + (memberId % 1000);
  const random1 = Math.floor(8999 * Math.random()) + 1000;
  const random2 = Math.floor(32767 * Math.random()) + 32768;
  const random3 = Math.floor(10 * Math.random());
  const random4 = Math.floor(10 * Math.random());
  const random5 = Math.floor(10 * Math.random());
  const memberIdFirst4 = +(memberId.toString().substr(0, 4));
  const chaosRandom = (4132653 + random2) * (memberIdFirst4 + 1000)
    - now + (1875979 + 9 * random2) - memberId;
  const seedChaosRandom = chaosRandom * seed;
  const resultStage1 = random3.toString() + memberIdLast3Random.toString()
    + seedChaosRandom.toString() + random1.toString();
  const resultStage1First8 = resultStage1.substr(0, 8);
  const resultStage1Rest = resultStage1.substr(8);
  const resultStage2 = resultStage1First8 + random4 + resultStage1Rest;
  const resultStage1First18 = resultStage2.substr(0, 18);
  const resultStage2Rest = resultStage2.substr(18);
  const resultStage3 = resultStage1First18 + random5 + resultStage2Rest + random2.toString();
  return resultStage3;
};

export default {
  getPortId,
};
