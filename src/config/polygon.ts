const contracts = {
    lensHub: '0xf3Fce0c9C3120Ee3b5742f18Fcd0EdD9cF08228F',
    follow: '0xE19122416BeeD4cbaDd663878de9af7c0eb32368',
    empty: '0x0000000000000000000000000000000000000000',
};

const tokens = {
    wmatic: {
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        decimals: 18,
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
