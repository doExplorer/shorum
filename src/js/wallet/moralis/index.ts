import axios from 'axios';
import config from '../config';

const header = { headers: { 'x-api-key': config.moralis } };

const getWalletNfts = async function (address, chain) {
    const url = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal`;
    const result = await axios.get(url, header);
    return result.data.result;
};

const getErc20Balance = async function (address, chain) {
    const url = `https://deep-index.moralis.io/api/v2/${address}/erc20?chain=${chain}`;
    const result = await axios.get(url, header);
    return result.data;
};

const getContractNfts = async function (address, chain) {
    const url = `https://deep-index.moralis.io/api/v2/nft/${address}?chain=${chain}&format=decimal`;
    const result = await axios.get(url, header);
    return result.data.result;
};

const getBalance = async function (address, chain) {
    const url = `https://deep-index.moralis.io/api/v2/${address}/balance?chain=${chain}`;
    const result = await axios.get(url, header);
    return result.data.balance;
};

export default { getWalletNfts, getErc20Balance, getBalance, getContractNfts };
