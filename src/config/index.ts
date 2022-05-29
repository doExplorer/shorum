const { REACT_APP_CHAIN_ENV } = process.env;

console.log('process', REACT_APP_CHAIN_ENV);

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
const envConf = require(`./${REACT_APP_CHAIN_ENV}`).default as {
    provider: string;
    chainId: number;
    contracts: {
        lensHub: string;
        follow: string;
        empty: string;
    };
    tokens: {
        usdt: {
            address: string;
            decimals: number;
        };
    };
};

export const coingeckoURL = 'https://api.coingecko.com/api/v3';

export const chainIdMapping = {
    1: 'ETH Mainnet',
    42: 'KOVAN',
    56: 'BSC Mainnet',
    128: 'HECO Mainnet',
    97: 'BSC Testnet',
    137: 'Polygon',
    80001: 'Mumbai',
};

export const supportChains = [1, 137, 80001];

export const chainKeyMapping = {
    1: 'eth',
    137: 'polygon',
    80001: 'mumbai',
};

export const chainThemeMapping = {
    1: '#ffeb3',
    137: '#3169FF',
    80001: '#FF7F33',
};

// if (CHAIN_ENV === "kovan") {
//   envConf = require("./kovan").default;
// } else if (CHAIN_ENV === "mainnet") {
//   envConf = require("./mainnet").default;
// }

export default {
    chainIdMapping,
    supportChains,
    chainKeyMapping,
    chainThemeMapping,
    ...envConf,
};

// export default {
//   // 默认要连接的network，测试环境默认用 test，生产环境默认用 ethereum
//   defaultNetwork: "binance",
//   //test(binance)
//   test: {
//     provider: "https://data-seed-prebsc-1-s1.binance.org:8545",
//     scanUrl: "https://testnet.bscscan.com/address",
//   },

//   // binance
//   binance: {
//     provider: "https://bsc-dataseed.binance.org",
//     scanUrl: "https://bscscan.com/address",
//   },
// };
