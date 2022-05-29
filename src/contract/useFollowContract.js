import { useContext, useEffect, useState } from 'react';
import config from '../config';
import BN from 'bignumber.js';
import { Web3Context } from '../context/Web3Context';
import useContract from '../hooks/useContract';
import FollowAbi from './abi/Follow.json';

export default function useFollowContract() {
    const { account, sendTx, web3 } = useContext(Web3Context);
    const contract = useContract(FollowAbi, config.contracts.follow);

    return {
        async invite(addresses, profileId) {
            const func = contract.methods.invite(addresses, profileId);
            return await sendTx(func, 'Invite');
        },
        async getProfileData(profileId) {
            return await contract.methods.getProfileData(profileId).call();
        },
    };
}
