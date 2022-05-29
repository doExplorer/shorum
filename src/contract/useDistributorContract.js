import { useContext, useEffect, useState } from 'react';
import config from '../config';
import BN from 'bignumber.js';
import { Web3Context } from '../context/Web3Context';
import useContract from '../hooks/useContract';
import DistributorAbi from './abi/Distributor.json';

export default function useDistributorContract(contractAddress) {
    const { account, sendTx, web3 } = useContext(Web3Context);

    return {
        async claimAllRewards(contractAddress) {
            const contract = new web3.eth.Contract(DistributorAbi, contractAddress);
            const func = contract.methods.claimAllRewards(account);
            return await sendTx(func, 'Claim reward');
        },
        async getClaimable(contractAddress) {
            const contract = new web3.eth.Contract(DistributorAbi, contractAddress);

            const earned = await contract.methods.earned(account, config.tokens.reward.address);

            return new BN(earned).shiftedBy(-config.tokens.reward.decimals).toFixed(2)

            // let earnList = [];

            // for (let i = 0; i < earnList; i++) {
            //     let address = tokens[i];

            //     const earned = contract.methods.earned(account, address);

            //     earnList.push({
            //         address,
            //         earned,
            //     });
            // }

            // return earnList;

        },
    };
}
