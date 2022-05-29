const contracts = {
    lensHub: '0x0f6c67F2b78a231d6920b8825C6bdb1A4B715Df7',
    follow: '0x38d01a8E1d70404B1d25fd0E5ACbf95C672c0C4A',
    empty: '0x0000000000000000000000000000000000000000',
};

const tokens = {
    usdt: {
        // this is wMatic, for now
        address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
        decimals: 18,
    },
};

const chainId = 80001;

const provider = 'https://mainnet.infura.io/v3/5c1d553a12864af9bd132ef3802ac46e';

const conf = {
    provider,
    chainId,
    contracts,
    tokens,
};

export default conf;
