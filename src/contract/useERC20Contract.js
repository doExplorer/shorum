import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import ERC20Abi from './abi/ERC20.json';

export default function useERC20Contract() {
    const { account, sendTx, web3 } = useContext(Web3Context);

    return {
        async getAllowance(tokenAddress, contractAddress) {
            const contract = new web3.eth.Contract(ERC20Abi, tokenAddress);
            return await contract.methods.allowance(account, contractAddress).call();
        },
        async balanceOf(tokenAddress) {
            const contract = new web3.eth.Contract(ERC20Abi, tokenAddress);
            console.log('Con', contract)
            return await contract.methods.balanceOf(account).call();
        },
        async approve(tokenAddress, contractAddress) {
            const contract = new web3.eth.Contract(ERC20Abi, tokenAddress);
            const func = contract.methods.approve(contractAddress, web3.utils.toWei('10000000000000', 'ether'));
            return await sendTx(func, 'Approve');
        },
    };
}
