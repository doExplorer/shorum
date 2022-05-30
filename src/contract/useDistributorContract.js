import { useContext } from 'react';
import config from '../config';
import BN from 'bignumber.js';
import { Web3Context } from '../context/Web3Context';
import DistributorAbi from './abi/Distributor.json';

export default function useDistributorContract(contractAddress) {
    const { account, sendTx, web3 } = useContext(Web3Context);

    return {
        async claimAllRewards(contractAddress) {
            const contract = new web3.eth.Contract(DistributorAbi, contractAddress);
            const func = contract.methods.claimAllRewards(account);
            return await sendTx(func, 'Claim reward');
        },
        async notifyRewardAmount(contractAddress, amount) {
            const contract = new web3.eth.Contract(DistributorAbi, contractAddress);
            const func = contract.methods.notifyRewardAmount(
                config.tokens.wmatic.address,
                new BN(amount).shiftedBy(config.tokens.wmatic.decimals).toString()
            );
            return await sendTx(func, 'Add reward');
        },
        async getClaimable(contractAddress) {
            const contract = new web3.eth.Contract(DistributorAbi, contractAddress);

            const earned = await contract.methods.earned(account, config.tokens.wmatic.address).call();

            console.log(earned, 'EARNED', typeof earned);
            if (earned === '0') {
                return '0';
            } else {
                return new BN(earned).shiftedBy(-config.tokens.wmatic.decimals).toFixed(2);
            }
        },
    };
}
