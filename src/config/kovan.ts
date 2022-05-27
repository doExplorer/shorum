const contracts = {
    funding: '0x708ba57DfaFC18AD373a7153fEC097Cb560a6131',
};

const tokens = {
    mos: {
        address: '0xf52020116c76b1620cb1e294B10f49693673127A',
        decimals: 18,
    },
    usdc: {
        address: '0x3f883c35cabd7c39d302bb30bbceebef89f8a116',
        decimals: 6,
    },
};

const chainId = 42;

const provider = 'https://kovan.infura.io/v3/5c1d553a12864af9bd132ef3802ac46e';

const conf = {
    provider,
    chainId,
    contracts,
    tokens,
};

export default conf;
