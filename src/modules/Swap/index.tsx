import React, { useState, useEffect } from 'react';
import AppHeader from 'components/AppHeader';
import { Input, message } from 'antd';
import config from 'config';
import { useWallet } from 'use-wallet';
import BN, { BigNumber } from 'bignumber.js';

import CommonContractApi from 'contract/CommonContractApi';
import FundingContractApi from 'contract/FundingContractApi';
// import Web3 from "web3";

import './style.less';
import ActionButton from 'components/ActionButton';
import BottomCircle from '../../assets/bottom-circle.svg';
import TopCircle from '../../assets/top-circle.svg';
import SwapIcon from '../../assets/swap-icon.svg';
import MOSIcon from '../../assets/tokens/mos.svg';
import USDCIcon from '../../assets/tokens/usdc.svg';

export default function SwapPage() {
    const [percent, setPercent] = useState(0);
    const [raised, setRaised] = useState(0 as BigNumber.Value);
    const [fromToken, setFromToken] = useState(
        {} as {
            icon?: string;
            symbol?: string;
            balance?: BigNumber.Value;
        }
    );
    const [fromAmount, setFromAmount] = useState(0 as BigNumber.Value);
    const [toToken, setToToken] = useState(
        {} as {
            icon?: string;
            symbol?: string;
            balance?: BigNumber.Value;
        }
    );
    const [toAmount, setToAmount] = useState(0 as BigNumber.Value);
    const [rate, setRate] = useState(0);
    const wallet = useWallet();
    const { account } = wallet;

    const fundingContractApi = FundingContractApi(wallet);
    const commonContractApi = CommonContractApi(wallet);

    useEffect(() => {
        setFromToken({
            icon: USDCIcon,
            symbol: 'USDC',
            balance: 0,
        });
        setToToken({
            icon: MOSIcon,
            symbol: 'MOS',
            balance: 0,
        });
    }, []);

    const fromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFromAmount(e.target.value);
    };

    // const swapOrder = () => {
    //   const fromTokenTmp = JSON.parse(JSON.stringify(fromToken));
    //   const toTokenTmp = JSON.parse(JSON.stringify(toToken));
    //   setFromToken(toTokenTmp);
    //   setToToken(fromTokenTmp);
    // };

    const getUSDCBalance = async () => {
        const result = await commonContractApi.balanceOf(config.tokens.usdc);
        setFromToken((prev) => {
            prev.balance = result;
            return {
                ...prev,
            };
        });
    };

    const getMOSBalance = async () => {
        const result = await commonContractApi.balanceOf(config.tokens.mos);
        setToToken((prev) => {
            prev.balance = result;
            return prev;
        });
    };

    const getRaised = async () => {
        const result = await commonContractApi.totalSupply(config.tokens.mos);

        setRaised(result);
        setPercent(new BN(result).div(5000000).times(100).toNumber());
    };

    const getRate = async () => {
        const result = await fundingContractApi.getRate();
        setRate(result);
    };

    const doContribute = async () => {
        if (!fromAmount || Number.isNaN(fromAmount as number)) {
            message.error('Please enter valid amount');
            return false;
        }
        await fundingContractApi.contribute(fromAmount);
        getRaised();
        getUSDCBalance();
        getMOSBalance();
    };

    const connectWallet = () => {
        if (wallet && wallet.status !== 'connected') {
            wallet.connect();
        }
    };

    useEffect(() => {
        if (account) {
            getRaised();
            getRate();
            getUSDCBalance();
            getMOSBalance();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    useEffect(() => {
        if (!fromAmount || !rate) {
            setToAmount(0);
            return;
        }
        const amount = new BN(fromAmount).times(rate).toFormat();
        setToAmount(amount);
    }, [fromAmount, rate]);

    return (
        <div className="swap-page">
            <img src={TopCircle} className="top-circle" alt="" />
            <img src={BottomCircle} className="bottom-circle" alt="" />
            <AppHeader />
            <div className="container">
                <div className="page-title">Cornerstone Round</div>
                <ul className="round-desc">
                    <li>The hard cap of this round is 5 million USDC for a total of 100,000,000 MOS tokens.</li>
                    <li>
                        Each investment tranche is <span className="green">100,000 USDC</span> and there is no limit on
                        the number of investment tranches each investor can purchase.
                    </li>
                </ul>
                <div className={`progress-area ${percent <= 50 ? 'low' : 'high'}`}>
                    <div className="labels">
                        <div className="raised">${raised}</div>
                        <div>$5 million</div>
                    </div>
                    <div className="bar">
                        <div className="percent" style={{ width: `${percent}%` }} />
                    </div>
                </div>
                <div className="separate-line" />
                <div className="swap-area">
                    <img src={SwapIcon} className="swap-icon" alt="" />
                    <div className="swap-card">
                        <div className="token-info">
                            <img src={fromToken.icon} className="icon" alt="" />
                            <div>
                                <div className="symbol">{fromToken.symbol}</div>
                                <div className="rate">1 USDC = {rate} MOS</div>
                            </div>
                        </div>
                        <div className="input-area">
                            <Input
                                className="input"
                                value={fromAmount as string | number}
                                onChange={fromAmountChange}
                            />
                            <div className="action-hint">You Send</div>
                        </div>
                        <div className="balance">
                            Balance: {fromToken.balance} {fromToken.symbol}
                        </div>
                    </div>
                    <div className="swap-card">
                        <div className="token-info">
                            <img src={toToken.icon} className="icon" alt="" />
                            <div>
                                <div className="symbol">{toToken.symbol}</div>
                                <div className="rate">1 MOS = {(1 / rate).toFixed(4)} USDC</div>
                            </div>
                        </div>
                        <div className="input-area">
                            <Input className="input" value={toAmount as string | number} disabled />
                            <div className="action-hint blue">You Get</div>
                        </div>
                        <div className="balance">
                            Balance: {toToken.balance} {toToken.symbol}
                        </div>
                    </div>
                </div>
                <div className="action-area">
                    {wallet.status === 'connected' ? (
                        <ActionButton
                            tokenAddress={config.tokens.usdc.address}
                            contractAddress={config.contracts.funding}>
                            <a href="#/" className="btn-blue" onClick={doContribute}>
                                Swap
                            </a>
                        </ActionButton>
                    ) : (
                        <a href="#/" className="btn-blue" onClick={connectWallet}>
                            Connect Wallet
                        </a>
                    )}
                </div>
                <div className="desc">
                    <div className="desc1">
                        MetaOasis is starting a new paradigm of virtual real estate investment and development in the
                        age of the metaverse
                    </div>
                    <div className="desc2">
                        Why just be a visitor of the metaverse? <br />
                        We can build the metaverse together too!
                    </div>
                    <div className="desc3">
                        The MetaOasis aims to be a gateway for ownership and participation in the metaverse real estate
                        investment and development. The goal is to provide a more accessible means to invest, develop
                        and collaborate on metaverse lands and real estate together, <br />
                        <br />
                        so everyone, even people with limited capital resources, can have the opportunity to participate
                        and contribute to the evolution of the metaverse and to share the returns from this rapidly
                        growing sector.
                    </div>
                </div>
            </div>
        </div>
    );
}
