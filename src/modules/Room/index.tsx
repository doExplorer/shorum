import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import { Drawer, Button } from 'antd';
import { useWallet } from 'use-wallet';
import ModuleContainer from 'components/ModuleContainer';
import AppCarousel from 'components/AppCarousel';
import Card from 'components/Card';
import Switch from 'components/Switch';
import AvatarList from 'components/AvatarList';
import FlexibleHeader, { defaultStatus, IStatus } from 'components/FlexibleHeader';
import List from './List';
import Nft from './Nft';

import './style.less';

import store from './store';

const Room = observer(function () {
    const { id } = useParams<{ id?: string }>();
    const [flexibleHeaderStatus, setFlexibleHeaderStatus] = useState(defaultStatus);
    const wallet = useWallet();
    const { account } = wallet;

    useEffect(() => {
        store.loadData({ id, account });
    }, [id, account]);

    useEffect(() => {
        return () => {
            store.clearData();
        };
    }, []);

    const handleStatusChange = (status: IStatus) => {
        if (['high', 'short'].includes(status)) {
            setFlexibleHeaderStatus(status);
        }
    };

    const { avatarUrl, room, address } = store;

    const isMine = account === address;

    return (
        <ModuleContainer className="room-page common-container">
            <div className="room-container">
                <FlexibleHeader
                    onChange={handleStatusChange}
                    highHeader={
                        <div className={classNames('room-title', { 'is-mine': isMine })}>
                            <div className="room-tilte-container">
                                <div className="room-avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
                                <div className="room-info">
                                    <div className="room-name">{room.name}</div>
                                    <div className="room-description">{room.description}</div>
                                    <div className="room-address">
                                        {address.slice(0, 6)}...{address.slice(-6)}
                                    </div>
                                    <div className="room-footer">
                                        <div className="room-avatar-list">
                                            <AvatarList
                                                options={store.followingAvatarList}
                                                avatarField="avatar"
                                                maxCount={5}
                                            />
                                        </div>
                                        <Choose>
                                            <When condition={isMine}>
                                                {/* <Switch
                                                    value={store.roomType}
                                                    unCheckedChildren="Onwer"
                                                    checkedChildren={room?.name || ''}
                                                    values={store.roomTypeValues}
                                                    onChange={store.handleRoomTypeSwitch}
                                                /> */}
                                                <Button type="primary" size="large" ghost>
                                                    Owned
                                                </Button>
                                            </When>
                                            <Otherwise>
                                                <Choose>
                                                    <When condition={store.isBacked}>
                                                        <Button
                                                            onClick={store.onClaimClick}
                                                            type="primary"
                                                            size="large">
                                                            Claim 20 USDC
                                                        </Button>
                                                    </When>
                                                    <Otherwise>
                                                        <Button onClick={store.onBackClick} type="primary" size="large">
                                                            Back
                                                        </Button>
                                                    </Otherwise>
                                                </Choose>
                                            </Otherwise>
                                        </Choose>
                                    </div>
                                </div>
                                <If condition={!isMine}>
                                    <div className="switch-room-type">
                                        {/* <Switch
                                            value={store.roomType}
                                            unCheckedChildren="Onwer"
                                            checkedChildren={room?.name || ''}
                                            values={store.roomTypeValues}
                                            onChange={store.handleRoomTypeSwitch}
                                        /> */}
                                        <Button type="primary" size="large" ghost>
                                            Owned
                                        </Button>
                                    </div>
                                </If>
                            </div>
                        </div>
                    }
                    shortHeader={null}>
                    <div className={classNames('room-body', { 'app-list': flexibleHeaderStatus === 'short' })}>
                        <Choose>
                            <When condition={flexibleHeaderStatus === 'short'}>
                                <List />
                            </When>
                            <Otherwise>
                                <AppCarousel slidesToShow={5}>
                                    {Array.from(store.nfts, (item, index) => {
                                        return (
                                            <Card
                                                key={index}
                                                className="nft-card"
                                                imageUrl={item.imageUrl}
                                                onClick={() => {
                                                    store.handleNftClick(item);
                                                }}
                                            />
                                        );
                                    })}
                                </AppCarousel>
                            </Otherwise>
                        </Choose>
                    </div>
                </FlexibleHeader>
            </div>
            <Drawer
                className="nft-drawer"
                placement="bottom"
                closable={false}
                mask={false}
                visible={store.nftVisible}
                height="calc(100% - 93px)">
                <Nft onClose={store.onNftBack} />
            </Drawer>
        </ModuleContainer>
    );
});

export default Room;
