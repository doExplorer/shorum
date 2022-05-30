import { useContext, useEffect, useState } from 'react';
import config from '../config';
import BN from 'bignumber.js';
import { Web3Context } from '../context/Web3Context';
import useContract from '../hooks/useContract';
import LensHubAbi from './abi/LensHub.json';

export default function useLensHubContract() {
    const { account, sendTx, web3 } = useContext(Web3Context);
    const contract = useContract(LensHubAbi, config.contracts.lensHub);

    return {
        async createProfile(profileInfo) {
            const initData = web3.eth.abi.encodeParameters(
                ['uint256', 'address', 'address'],
                [
                    new BN(profileInfo.backFee).shiftedBy(config.tokens.usdt.decimals).integerValue(),
                    config.tokens.usdt.address,
                    account,
                ]
            );

            const finalData = {
                to: account,
                handle: profileInfo.name,
                imageURI: profileInfo.avatar,
                followModule: config.contracts.follow,
                followModuleInitData: initData,
                followNFTURI: 'https://ipfs.io/ipfs/QmTFLSXdEQ6qsSzaXaCSNtiv6wA56qq87ytXJ182dXDQJS',
            };

            const func = contract.methods.createProfile(finalData);
            return await sendTx(func, 'Create Profile');
        },
        async getProfileIdByHandle(handle) {
            return await contract.methods.getProfileIdByHandle(handle).call();
        },
        async getFollowNFT(profileId) {
            return await contract.methods.getFollowNFT(profileId).call();
        },
        async tokenOfOwnerByIndex(address, index) {
            return await contract.methods.tokenOfOwnerByIndex(address, index).call();
        },
        async follow(profileId, currency, amount) {
            const initData = web3.eth.abi.encodeParameters(['address', 'uint256'], [currency, amount]);
            const func = contract.methods.follow([profileId], [initData]);
            return await sendTx(func, 'Follow');
        },
    };
}
