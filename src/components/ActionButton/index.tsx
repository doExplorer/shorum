import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useWallet } from 'use-wallet';
import CommonContractApi from 'contract/CommonContractApi';

export default function ActionButton(props: {
    tokenAddress: string;
    contractAddress: string;
    children?: React.ReactNode;
}) {
    const { tokenAddress, contractAddress, children } = props;
    const [allowance, setAllowance] = useState(0);
    const [approving, setApproving] = useState(false);
    const wallet = useWallet();
    const currentAccount = wallet.account;
    const commonContractApi = CommonContractApi(wallet);

    const checkAllowance = async () => {
        const result = await commonContractApi.getAllowance(tokenAddress, contractAddress);
        setAllowance(result);
    };

    useEffect(() => {
        if (currentAccount && tokenAddress && contractAddress) {
            checkAllowance();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenAddress, contractAddress, currentAccount]);

    const doApprove = async () => {
        if (approving) {
            return;
        }
        setApproving(true);
        try {
            await commonContractApi.doApprove(tokenAddress, contractAddress);
            setApproving(false);
            checkAllowance();
        } catch (err) {
            setApproving(false);
        }
    };

    return allowance > 0 || !tokenAddress ? (
        <>{children}</>
    ) : (
        <a
            href="#/"
            className={classNames(`${approving ? 'btn-grey' : 'btn-blue'}`, {
                disabled: approving,
            })}
            onClick={doApprove}>
            {approving && <span>APPROVING</span>}
            {!approving && <span>APPROVE</span>}
        </a>
    );
}
