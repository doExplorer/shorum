import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import { useWallet } from 'use-wallet';
import ModuleContainer from 'components/ModuleContainer';
import AppCarousel from 'components/AppCarousel';
import Card from 'components/Card';
import hashHistory from 'hash-history';
import CommonContractApi from 'contract/CommonContractApi';
import FundingContractApi from 'contract/FundingContractApi';
// import Web3 from "web3";

import createStore from '../Create/store';
import store from './store';

import './style.less';

const LandingPage = observer(function () {
    const wallet = useWallet();
    const { account } = wallet;

    const fundingContractApi = FundingContractApi(wallet);
    const commonContractApi = CommonContractApi(wallet);

    const onCreate = () => {
        createStore.clearData();
        hashHistory.push('/create');
    };

    useEffect(() => {
        store.loadData();
    }, []);

    const roomData = Array.from(store.roomData);

    return (
        <ModuleContainer
            className="landing-page"
            footer={
                <div className="footer-btns">
                    <Button onClick={onCreate} type="primary" size="large">
                        Create your own shorum
                    </Button>
                </div>
            }>
            <div className="show-card-box">
                <div className="show-card-box-list">
                    <AppCarousel slidesToShow={4}>
                        {Array.from(store.roomData, (item, index) => {
                            return <Card key={index} imageUrl={item.imageUrl} />;
                        })}
                    </AppCarousel>
                </div>
                <div className="show-card-box-footer">
                    <div className="box-image" />
                </div>
            </div>
        </ModuleContainer>
    );
});

export default LandingPage;
