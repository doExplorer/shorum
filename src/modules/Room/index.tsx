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
// import Switch from 'components/Switch';
import AvatarList from 'components/AvatarList';
import FlexibleHeader, { defaultStatus, IStatus } from 'components/FlexibleHeader';
import BN from 'bignumber.js';
import { Web3Context } from '@/context/Web3Context';
import { IProfileData } from './interface';
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
    const [profileId, setProfileId] = useState('');
    const [payAmount, setPayAmount] = useState('');
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

    const checkClaimable = async (distributor: string) => {
        console.log('distributor address: ', distributor);
        const result = await distributorContract.getClaimable(distributor);
        setClaimable(result);
    };

    const doClaim = async () => {
        await distributorContract.claimAllRewards(profileData.distributor);
    };

    const checkFollow = async (profileId: string, distributor: string) => {
        const nftAddress = await lensHubContract.getFollowNFT(profileId);
        if (nftAddress === config.contracts.empty) {
            setIsFollowing(false);
        } else {
            const balance = await erc721Contract.balanceOf(nftAddress);
            if (balance > 0) {
                console.log('ready check', profileData);
                checkClaimable(distributor);
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        }
    };

    const doFollow = async () => {
        await lensHubContract.follow(profileId, profileData.currency, profileData.amount);
    };

    const getProfileData = async () => {
        // default get the first one
        const pId = await lensHubContract.tokenOfOwnerByIndex(id, 0);
        let result = await followContract.getProfileData(pId);
        setProfileData(result);
        setPayAmount(new BN(result.amount).shiftedBy(-18).toString());
        checkFollow(pId, result.distributor);
        setProfileId(pId);
    };

    useEffect(() => {
        if (!account) {
            return;
        }
        getProfileData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                <div
                                    className="room-avatar avatar-default"
                                    style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                                />
                                <div className="room-info">
                                    <div className="room-name">{room.name}</div>
                                    <div className="room-description">{room.description}</div>
                                    <div className="room-address">
                                        {address.slice(0, 6)}...{address.slice(-6)}
                                    </div>
                                    <br />
                                    {profileData?.distributor && (
                                        <div className="room-address">
                                            Distributor address: {profileData.distributor}
                                        </div>
                                    )}

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
                                                        Claim {claimable} WMATIC
                                                    </Button>
                                                )}
                                                {isFollowing ? (
                                                    <Button type="primary" size="large">
                                                        Backed
                                                    </Button>
                                                ) : (
                                                    <ActionButton
                                                        tokenAddress={config.tokens.wmatic.address}
                                                        contractAddress={config.contracts.follow}
                                                        approveText={'Back'}
                                                        onApproved={doFollow}>
                                                        <Button onClick={doFollow} type="primary" size="large">
                                                            Back {payAmount && `(${payAmount} WMATIC)`}
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
                            <When condition={!store.nfts.length}>
                                <div className="data-empty">{`There's no NFTs to show`}</div>
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
