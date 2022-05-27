import Web3 from 'web3';
import mm from 'lib/mm';
import BN, { BigNumber } from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import { Wallet } from 'use-wallet/dist/cjs/types';
import FundingAbi from './abi/Funding.json';
import config from '../config';

function FundingContractApi(wallet: Wallet) {
    const web3 = new Web3(wallet.ethereum);
    const contract = new web3.eth.Contract(FundingAbi as AbiItem[], config.contracts.funding);
    const { account } = wallet;

    return {
        async getRate() {
            const result = await contract.methods.rate().call();
            return new BN(result).shiftedBy(-12).toNumber();
        },
        async contribute(amount: BigNumber.Value) {
            const amountInWei = new BN(amount).shiftedBy(config.tokens.usdc.decimals).toString();

            console.log('amount in wei', amountInWei);
            return new Promise((resolve, reject) => {
                contract.methods
                    .contribute(amountInWei)
                    .send({
                        from: account,
                    })
                    .on('transactionHash', function (transactionHash: string) {
                        mm.listen(transactionHash, 'Contribute');
                        return transactionHash;
                    })
                    .on('receipt', (receipt: any) => {
                        resolve(receipt);
                    })
                    .on('error', function (error: any) {
                        reject(error);
                        console.log('error', error);
                    });
            });
        },
    };
}

export default FundingContractApi;
