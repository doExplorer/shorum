import React, { useEffect, useState, useContext } from 'react';
import { Button } from 'antd';
import { Web3Context } from '@/context/Web3Context';
import useERC20Contract from '@/contract/useERC20Contract';

export default function ActionButton({ tokenAddress, contractAddress, children, onApproved }) {
    const { account, connectWallet } = useContext(Web3Context);
    const [allowance, setAllowance] = useState(0);
    const [approving, setApproving] = useState(false);
    const erc20Contract = useERC20Contract();

    const checkAllowance = async () => {
        const result = await erc20Contract.getAllowance(tokenAddress, contractAddress);
        setAllowance(result);
    };

    useEffect(() => {
        if (account && tokenAddress && contractAddress) {
            checkAllowance();
        }
    }, [tokenAddress, contractAddress, account]);

    const doApprove = async () => {
        setApproving(true);
        try {
            await erc20Contract.approve(tokenAddress, contractAddress);
            if (onApproved) {
                onApproved();
            }
            setApproving(false);
            checkAllowance();
        } catch (err) {
            setApproving(false);
        }
    };

    return account ? (
        allowance > 0 || !tokenAddress ? (
            <>{children}</>
        ) : (
            <Button type="primary" size="large" onClick={doApprove}>
                {approving && <span>APPROVING...</span>}
                {!approving && <span>APPROVE</span>}
            </Button>
        )
    ) : (
        <Button className="btn-stake" onClick={connectWallet} type="primary" size="large">
            Connect Wallet
        </Button>
    );
}
