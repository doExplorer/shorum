import React, { useState, createContext, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useWallet } from 'use-wallet';
import { LoadingOutlined } from '@ant-design/icons';
// import { subscribe, emit } from "@nextcloud/event-bus";
import Web3 from 'web3';
import utils from '../js/utils';
import config from '../config';

export const Web3Context = createContext({
    web3: null,
    chainId: null,
    networkId: null,
    blockNumber: null,
    account: null,
    connectModalVisible: null,
    connector: null,
    openConnectWallet: async () => {},
    closeConnectWallet: async () => {},
    connectWallet: async () => {},
    resetWallet: async () => {},
    estimateGas: async () => {},
    sendTx: async () => {},
});

export const Web3ContextProvider = ({ children }) => {
    const wallet = useWallet();
    const [web3, setWeb3] = useState('');
    const [account, setAccount] = useState('');
    const [chainId, setChainId] = useState('');
    const [networkId, setnetworkId] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [connector, setConnector] = useState('');
    const [connectModalVisible, setConnectModalVisible] = useState(false);

    const openConnectWallet = () => {
        setConnectModalVisible(true);
    };

    const closeConnectWallet = () => {
        setConnectModalVisible(false);
    };

    const connectWallet = useCallback(async (walletName = 'injected') => {
        try {
            await wallet.connect(walletName);

            const web3Raw = new Web3(window.ethereum);
            setWeb3(web3Raw);

            console.log('web3 is', web3Raw);

            // get account, use this variable to detech if user is connected
            const accounts = await web3Raw.eth.getAccounts();

            setAccount(accounts[0]);

            // get network id
            setnetworkId(await web3Raw.eth.net.getId());

            // get chain id
            const chainId = await web3Raw.eth.getChainId();
            setChainId(chainId);
            utils.setChain(chainId);

            // init block number
            setBlockNumber(await web3Raw.eth.getBlockNumber());

            setConnector(wallet.connector);
        } catch (error) {
            // console.log('set to project provided web3', config.provider)
            setWeb3(new Web3(config.provider));
            console.log(error);
        }
    }, []);

    const resetWallet = useCallback(async () => {
        wallet.reset();
        setAccount('');
    }, []);

    const estimateGas = async (func, value = 0) => {
        try {
            const gas = await func.estimateGas({
                from: account,
                value,
            });
            return Math.floor(gas * 1.2);
        } catch (error) {
            console.log('error', error);
            const objStartIndex = error.message.indexOf('{');
            toast.error(error.message.slice(0, objStartIndex));
        }
    };

    /**
     *
     * @param {*} func , required
     * @param {*} title , required
     * @param {*} value , default 0
     * @returns
     */

    const sendTx = async (func, title, value = 0) => {
        const gasLimit = await estimateGas(func, value);
        if (!isNaN(gasLimit)) {
            return func
                .send({
                    // gas: gasLimit,
                    from: account,
                    value,
                })
                .on('transactionHash', (txnHash) => {
                    // emit("startMint", txnHash);
                    toast.info(title, {
                        toastId: txnHash,
                        icon: <LoadingOutlined />,
                        autoClose: false,
                        onClick: () => goScan(txnHash),
                    });
                })
                .on('receipt', async (receipt) => {
                    const txnHash = receipt?.transactionHash;

                    console.log(receipt, 'receipt is');
                    await toast.dismiss(txnHash);
                    toast.success(title, {
                        toastId: txnHash,
                        onClick: () => goScan(txnHash),
                    });
                })
                .on('error', async (err, txn) => {
                    const txnHash = txn?.transactionHash;
                    await toast.dismiss(txnHash);

                    if (err.code === 4001) {
                        toast.error('User canceled action');
                    } else {
                        toast.error(title, {
                            onClick: () => goScan(txnHash),
                        });
                    }
                });
        }
    };

    useEffect(() => {
        if (!account) {
            return;
        }
        const subscription = web3.eth.subscribe('newBlockHeaders', (error, block) => {
            if (!error) {
                setBlockNumber(block.number);
            }
        });

        return () => {
            subscription.unsubscribe((error, success) => {
                if (success) {
                    console.log('Unsubscribed');
                }
            });
        };
    }, [account]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('wallet id', parseInt(chainId));
                utils.setChain(parseInt(chainId));
                window.location.reload();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Web3Context.Provider
            value={{
                web3,
                chainId,
                networkId,
                account,
                blockNumber,
                connectModalVisible,
                connector,
                openConnectWallet,
                closeConnectWallet,
                connectWallet,
                resetWallet,
                estimateGas,
                sendTx,
            }}>
            <div id="123">{children}</div>
        </Web3Context.Provider>
    );
};

export const Web3ContextConsumer = Web3Context.Consumer;
