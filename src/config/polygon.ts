const contracts = {
  funding: '0x2Fcd20F97F27c3Ef78AC98189C3C1f22678A955E',
};

const tokens = {
  mos: {
      address: '0x6ECD8Db3Afc9DA075BaE38eb706D542409E9981b',
      decimals: 18,
  },
  usdc: {
      address: '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
      decimals: 6,
  },
};

const chainId = 137;

const provider = 'https://polygon-rpc.com';

const conf = {
  provider,
  chainId,
  contracts,
  tokens,
};

export default conf;
