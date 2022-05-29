import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import config from 'config';
import { Drawer, Button } from 'antd';
import useFollowContract from 'contract/useFollowContract';
import useLensHubContract from 'contract/useLensHubContract';
import useDistributorContract from 'contract/useDistributorContract';
import useERC721Contract from 'contract/useERC721Contract';
import ModuleContainer from 'components/ModuleContainer';
import AppCarousel from 'components/AppCarousel';
import Card from 'components/Card';
import ActionButton from 'components/ActionButton';
import { IProfileData } from './interface';
// import Switch from 'components/Switch';
import AvatarList from 'components/AvatarList';
import FlexibleHeader, { defaultStatus, IStatus } from 'components/FlexibleHeader';
import { Web3Context } from '@/context/Web3Context';
import List from './List';
import Nft from './Nft';

import './style.less';

import store from './store';

const Room = observer(function () {
    const { id } = useParams<{ id?: string }>();
    const { account } = useContext(Web3Context);
    const [flexibleHeaderStatus, setFlexibleHeaderStatus] = useState(defaultStatus);
    const [isFollowing, setIsFollowing] = useState(false);
    const [profileData, setProfileData] = useState<IProfileData>();
    const [claimable, setClaimable] = useState('');
    const followContract = useFollowContract();
    const lensHubContract = useLensHubContract();
    const distributorContract = useDistributorContract();
    const erc721Contract = useERC721Contract();

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

    const checkClaimable = async () => {
        console.log('distributor address: ',profileData.distributor)
        const result = await distributorContract.getClaimable(profileData.distributor);
        setClaimable(result)
    };

    const doClaim = async () => {
        const result = await distributorContract.claimAllRewards(profileData.distributor);
    };

    const checkFollow = async () => {
        const nftAddress = await lensHubContract.getFollowNFT(id);
        if (nftAddress === config.contracts.empty) {
            setIsFollowing(false);
        } else {
            const balance = await erc721Contract.balanceOf(nftAddress);
            if (balance > 0) {
                checkClaimable();
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        }
    };

    const doFollow = async () => {
        // TODO, follow failed
        const result = await lensHubContract.follow(id, profileData.currency, profileData.amount);
    };

    useEffect(() => {
        if (!profileData) {
            return;
        }
        checkFollow()
    }, [profileData]);

    const getProfileData = async () => {
        const result = await followContract.getProfileData(id);
        setProfileData(result);
    };

    useEffect(() => {
        if (!account) {
            return;
        }
        getProfileData();
    }, [account]);

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
                                                {claimable && (
                                                    <Button
                                                        onClick={doClaim}
                                                        type="primary"
                                                        size="large"
                                                        style={{ marginRight: '8px' }}>
                                                        Claim {claimable} USDT
                                                    </Button>
                                                )}
                                                {isFollowing ? (
                                                    <Button type="primary" size="large">
                                                        Backed
                                                    </Button>
                                                ) : (
                                                    <ActionButton
                                                        tokenAddress={config.tokens.usdt.address}
                                                        contractAddress={config.contracts.follow}
                                                        onApproved={doFollow}>
                                                        <Button onClick={doFollow} type="primary" size="large">
                                                            Back
                                                        </Button>
                                                    </ActionButton>
                                                )}
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
