const { REACT_APP_CHAIN_ENV } = process.env;

console.log('process', REACT_APP_CHAIN_ENV);

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
const envConf = require(`./${REACT_APP_CHAIN_ENV}`).default as {
    provider: string;
    chainId: number;
    contracts: {
        funding: string;
    };
    tokens: {
        mos: {
            address: string;
            decimals: number;
        };
        usdc: {
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
    80001: 'Mumbai',
    137: 'Polygon',
};

// if (CHAIN_ENV === "kovan") {
//   envConf = require("./kovan").default;
// } else if (CHAIN_ENV === "mainnet") {
//   envConf = require("./mainnet").default;
// }

export default {
    chainIdMapping,
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
