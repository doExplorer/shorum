import Web3 from 'web3';
import { notification } from 'antd';
import BN from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import { Wallet } from 'use-wallet/dist/cjs/types';
import Erc20Abi from './abi/ERC20.json';

function CommonContractApi(wallet: Wallet) {
    const web3 = new Web3(wallet.ethereum);
    const { account } = wallet;

    return {
        async getAllowance(tokenAddress: string, contractAddress: string) {
            const tokenContract = new web3.eth.Contract(Erc20Abi as AbiItem[], tokenAddress);

            return new Promise<number>((resolve, reject) => {
                tokenContract.methods
                    .allowance(wallet.account, contractAddress)
                    .call()
                    .then((res: number) => {
                        resolve(res);
                    })
                    .catch((err: any) => {
                        console.log('Error', err);
                    });
            });
        },

        async balanceOf(token: { address: string; decimals: number }) {
            const tokenContract = new web3.eth.Contract(Erc20Abi as AbiItem[], token.address);
            return new Promise<string>((resolve, reject) => {
                tokenContract.methods
                    .balanceOf(wallet.account)
                    .call()
                    .then((res: any) => {
                        resolve(new BN(res).shiftedBy(-token.decimals).toString());
                    })
                    .catch((err: any) => {
                        console.log('Error', err);
                        reject(err);
                    });
            });
        },

        async totalSupply(token: { address: string; decimals: number }) {
            const tokenContract = new web3.eth.Contract(Erc20Abi as AbiItem[], token.address);
            return new Promise<string>((resolve, reject) => {
                tokenContract.methods
                    .totalSupply()
                    .call()
                    .then((res: any) => {
                        resolve(new BN(res).shiftedBy(-token.decimals).toFormat());
                    })
                    .catch((err: any) => {
                        console.log('Error', err);
                        reject(err);
                    });
            });
        },

        async doApprove(tokenAddress: string, contractAddress: string) {
            const tokenContract = new web3.eth.Contract(Erc20Abi as AbiItem[], tokenAddress);
            return new Promise((resolve, reject) => {
                notification.info({
                    message: 'Approving',
                });
                tokenContract.methods
                    .approve(contractAddress, Web3.utils.toWei('10000000000000', 'ether'))
                    .send({ from: account })
                    .then((res: any) => {
                        notification.success({
                            message: 'Successfully Approved',
                            description: `Tx Hash: ${res.transactionHash}`,
                        });
                        resolve(null);
                    })
                    .catch((err: any) => {
                        reject(err);
                        console.log(err);
                    })
                    .finally(() => {
                        resolve(null);
                    });
            });
        },
    };
}

export default CommonContractApi;
