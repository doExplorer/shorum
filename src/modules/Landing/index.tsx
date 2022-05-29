import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Button } from 'antd';
// import { useWallet } from 'use-wallet';
import hashHistory from 'hash-history';
import ModuleContainer from 'components/ModuleContainer';
import AppCarousel from 'components/AppCarousel';
import PersonCard from '@/modules/Landing/PersonCard';
import { IPerson } from './interface';

import createStore from '../Create/store';
import store from './store';

import './style.less';

const LandingPage = observer(function () {
    // const wallet = useWallet();

    const onCreate = () => {
        createStore.clearData();
        hashHistory.push('/create');
    };

    const onCardClick = (person: IPerson) => {
        hashHistory.push(`/room/${person.address}`);
    };

    useEffect(() => {
        store.loadData();
    }, []);

    // const roomData = Array.from(store.roomData);

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
                        {Array.from(store.personList, (item, index) => {
                            return (
                                <PersonCard
                                    key={index}
                                    className={classNames({
                                        even: index % 2,
                                    })}
                                    person={item}
                                    onClick={() => {
                                        onCardClick(item);
                                    }}
                                />
                            );
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
