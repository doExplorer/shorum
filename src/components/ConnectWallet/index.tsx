import React, { useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';

import NetworkModal from 'components/NetworkModal';
import config, { chainIdMapping } from 'config';
import { loggedIn } from './utils';
import './style.less';

export default function ConnectWallet(props: { triggerConnect: boolean }) {
    const { triggerConnect } = props;
    const [networkError, setNetworkError] = useState('');
    const wallet = useWallet();

    const connectWallet = () => {
        if (window.ethereum) {
            const configChainId = config.chainId;
            const walletChainId = parseInt(window.ethereum ? window.ethereum.chainId : '');

            if (walletChainId && !Number.isNaN(walletChainId) && configChainId !== walletChainId) {
                setNetworkError(
                    `${
                        chainIdMapping[configChainId as 1 | 42 | 56 | 128 | 97 | 80001]
                    }, your wallet id is ${walletChainId}`
                );
            } else {
                setNetworkError('');
            }

            if (wallet && wallet.status !== 'connected') {
                wallet.connect().then(() => {
                    loggedIn();
                });
            }
        } else {
            alert('Wallet not found on your device');
        }
    };

    useEffect(() => {
        window.addEventListener('ethereum#initialized', connectWallet, {
            once: true,
        });

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: any) => {
                connectWallet();
            });

            window.ethereum.on('chainChanged', (chainId: number) => {
                connectWallet();
                window.location.reload();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (triggerConnect) {
            connectWallet();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <a
                href="#/"
                className="btn-trans"
                onClick={() => {
                    connectWallet();
                }}>
                Connect
            </a>

            {networkError && (
                <NetworkModal
                    networkError={networkError}
                    onCancel={() => {
                        setNetworkError('');
                    }}
                />
            )}
        </>
    );
}
