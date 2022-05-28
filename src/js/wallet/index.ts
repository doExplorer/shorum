import knn from './knn';
import moralis from './moralis';

const getWalletInfo = async function (address: string, chain: string) {
    const nfts = await moralis.getWalletNfts(address, chain);
    const wallet = {
        address,
        nfts,
    };
    return wallet;
};

const getRelatedAddress = async function (address: string, option = 'RSS3_Follow', algo = 'OVERLAP') {
    const related = (await knn.getRelatedAddress(address, (option = 'RSS3_Follow'), (algo = 'OVERLAP'))) as {
        total: number;
        data: { address: string }[];
    };
    return related;
};

export default { getWalletInfo, getRelatedAddress };
