import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import useContract from '../hooks/useContract';
import ERC721Abi from './abi/ERC721.json';

export default function useERC721Contract() {
    const { account, sendTx, web3 } = useContext(Web3Context);

    return {
        async balanceOf(tokenAddress) {
            const contract = new web3.eth.Contract(ERC721Abi, tokenAddress);
            return await contract.methods.balanceOf(account).call();
        },
    };
}
