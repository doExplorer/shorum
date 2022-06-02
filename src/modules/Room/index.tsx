import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import hashHistory from 'hash-history';
import config from 'config';
import { Drawer, Button, message } from 'antd';
import IconCopy from '../../assets/copy-icon.svg';
import useFollowContract from 'contract/useFollowContract';
import useLensHubContract from 'contract/useLensHubContract';
import useDistributorContract from 'contract/useDistributorContract';
import useERC721Contract from 'contract/useERC721Contract';
import useERC20Contract from 'contract/useERC20Contract';
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
import { toast } from 'react-toastify';

const Room = observer(function () {
    const { id } = useParams<{ id?: string }>();
    const { account } = useContext(Web3Context);
    const [flexibleHeaderStatus, setFlexibleHeaderStatus] = useState(defaultStatus);
    const [isFollowing, setIsFollowing] = useState(false);
    const [profileData, setProfileData] = useState<IProfileData>();
    const [profileId, setProfileId] = useState('');
    const [payAmount, setPayAmount] = useState('');
    const [balance, setBalance] = useState('');
    const [rewardAmount, setRewardAmount] = useState('');
    const [claimable, setClaimable] = useState('');
    const [backersNum, setBackersNum] = useState('');
    const [addRewardVisible, setAddRewardVisible] = useState<boolean>(false);
    const followContract = useFollowContract();
    const lensHubContract = useLensHubContract();
    const distributorContract = useDistributorContract();
    const erc721Contract = useERC721Contract();
    const erc20Contract = useERC20Contract();

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

    const checkFollow = async (pId: string, distributor: string) => {
        const nftAddress = await lensHubContract.getFollowNFT(pId);
        if (nftAddress === config.contracts.empty) {
            setIsFollowing(false);
        } else {
            const result = await erc721Contract.balanceOf(nftAddress);
            if (result > 0) {
                console.log('ready check', profileData);
                checkClaimable(distributor);
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        }
    };

    const doFollow = async () => {
        if (balance < payAmount) {
            message.error(`Balance not enough, your current balance is ${balance} WMATIC`);
            return;
        }
        await lensHubContract.follow(profileId, profileData.currency, profileData.amount);
    };

    const goInvite = () => {
        hashHistory.push(`/invite/${profileId}`);
    };

    const addReward = async () => {
        if (balance < rewardAmount) {
            message.error(`Balance not enough, your current balance is ${balance} WMATIC`);
            return;
        }
        await distributorContract.notifyRewardAmount(profileData.distributor, rewardAmount);
        setRewardAmount('');
        setAddRewardVisible(false);
    };

    const getBackersNum = async (pId: string) => {
        const nftAddress = await lensHubContract.getFollowNFT(pId);
        const totalSupply = await erc721Contract.totalSupply(nftAddress);
        setBackersNum(totalSupply);
    };

    const getProfileData = async () => {
        // default get the first one
        const pId = await lensHubContract.tokenOfOwnerByIndex(id, 0);
        const result = await followContract.getProfileData(pId);
        setProfileData(result);
        const resultAmount = new BN(result.amount).shiftedBy(-18).toString()
        setPayAmount(resultAmount);
        checkFollow(pId, result.distributor);
        getBackersNum(pId);
        setProfileId(pId);
    };

    const getBalance = async () => {
        const result = new BN(await erc20Contract.balanceOf(config.tokens.wmatic.address))
            .shiftedBy(-config.tokens.wmatic.decimals)
            .toString();

        setBalance(result);
    };

    const doCopy = (text: string) => {
        const copied = document.createElement("input");
        copied.setAttribute("value", text);
        document.body.appendChild(copied);
        copied.select();
        document.execCommand("copy");
        document.body.removeChild(copied);
        toast.success('Copied address');
    }

    useEffect(() => {
        if (!account) {
            return;
        }
        getProfileData();
        getBalance();
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
                                    {backersNum && <div className="room-badge">{backersNum} Backers</div>}
                                    {/* <br /> */}
                                    {profileData?.distributor && (
                                        <div className="room-badge distributor-line">Distributor address: {profileData.distributor} <img src={IconCopy} className="copy-icon" onClick={() => doCopy(profileData.distributor)} /></div>
                                    )}
                                    <div className="room-description">{room.description}</div>

                                    <div className="room-footer">
                                        <div className="room-address">
                                            {address.slice(0, 6)}...{address.slice(-6)}
                                        </div>
                                        <Choose>
                                            <When condition={isMine}>
                                                {profileId && (
                                                    <>
                                                        <div className="add-reward-wrapper">
                                                            {addRewardVisible && (
                                                                <input
                                                                    value={rewardAmount}
                                                                    onChange={(e) => setRewardAmount(e.target.value)}
                                                                    type="text"
                                                                    className="add-reward-input"
                                                                />
                                                            )}
                                                            {addRewardVisible ? (
                                                                <Button type="primary" ghost onClick={addReward}>
                                                                    Confirm
                                                                </Button>
                                                            ) : (
                                                                <ActionButton
                                                                    tokenAddress={config.tokens.wmatic.address}
                                                                    contractAddress={profileData.distributor}
                                                                    approveText="Tipping"
                                                                    onApproved={() => setAddRewardVisible(true)}
                                                                    size="default"
                                                                    ghost>
                                                                    <Button
                                                                        type="primary"
                                                                        ghost
                                                                        onClick={() => setAddRewardVisible(true)}>
                                                                        Tip backers (WMATIC)
                                                                    </Button>
                                                                </ActionButton>
                                                            )}
                                                        </div>
                                                        <div className="invite-wrapper">
                                                            <Button type="primary" ghost onClick={goInvite}>
                                                                Invite
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}

                                                {/* <Switch
                                                    value={store.roomType}
                                                    unCheckedChildren="Onwer"
                                                    checkedChildren={room?.name || ''}
                                                    values={store.roomTypeValues}
                                                    onChange={store.handleRoomTypeSwitch}
                                                /> */}
                                                {/* <Button type="primary" size="large" ghost>
                                                    Owned
                                                </Button> */}
                                            </When>
                                            <Otherwise>
                                                {claimable && (
                                                    <Button
                                                        onClick={doClaim}
                                                        type="primary"
                                                        style={{ marginRight: '8px' }}
                                                        ghost>
                                                        Claim {claimable} WMATIC
                                                    </Button>
                                                )}
                                                {isFollowing ? (
                                                    <Button type="primary" ghost>
                                                        Backed
                                                    </Button>
                                                ) : (
                                                    <ActionButton
                                                        tokenAddress={config.tokens.wmatic.address}
                                                        contractAddress={config.contracts.follow}
                                                        approveText={`Back ${payAmount && `(${payAmount} WMATIC)`}`}
                                                        onApproved={doFollow}
                                                        size="default"
                                                        ghost>
                                                        <Button onClick={doFollow} type="primary" ghost>
                                                            Back {payAmount && `(${payAmount} WMATIC)`}
                                                        </Button>
                                                    </ActionButton>
                                                )}
                                            </Otherwise>
                                        </Choose>
                                        <div className="room-avatar-list">
                                            <AvatarList
                                                options={store.followingAvatarList}
                                                avatarField="avatar"
                                                maxCount={5}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* <If condition={!isMine}>
                                    <div className="switch-room-type">
                                        <Switch
                                            value={store.roomType}
                                            unCheckedChildren="Onwer"
                                            checkedChildren={room?.name || ''}
                                            values={store.roomTypeValues}
                                            onChange={store.handleRoomTypeSwitch}
                                        />
                                        <Button type="primary" size="large" ghost>
                                            Owned
                                        </Button>
                                    </div>
                                </If> */}
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
