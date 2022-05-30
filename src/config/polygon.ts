const contracts = {
    lensHub: '0x',
    follow: '0x',
    empty: '0x0000000000000000000000000000000000000000',
};

const tokens = {
    wmatic: {
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        decimals: 18,
    }
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
