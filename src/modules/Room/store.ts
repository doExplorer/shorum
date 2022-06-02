import { observable, action, computed } from 'mobx';
import { message } from 'antd';
import utils from 'utils';
import $axios from '$axios';
import ipfs from '@/js/ipfs';
import rss3 from '@/js/rss3';
import walleApi from '@/js/wallet';
import { INft } from './interface';
import nftStore from './Nft/store';

interface IProfile {
    name?: string;
    avatar?: string[];
    bio?: string;
    accounts?: {
        tags?: string[];
        id: string;
        signature?: string;
    }[];
}

class RoomStore {
    @observable address = '0x4700F51B1FEfF74Df41BED9C31D0b2e5662d35b8';

    @observable room: {
        name: string;
        avatar: string;
        description: string;
    } = {
        name: '',
        avatar: '',
        description: '',
    };

    @observable nfts: INft[] = [];

    @observable balance = 0.3068438025035108;

    @observable avatarList: IProfile[] = [];

    /** display NFT */
    @observable nftVisible = false;

    @observable roomType: 'owner' | 'room' = 'owner';

    roomTypeValues = ['owner', 'room'];

    @observable isBacked = false;

    @computed get avatarUrl() {
        if (!this.room || !this.room.avatar) {
            return '';
        }
        return ipfs.getUrl(this.room.avatar);
    }

    @action
    loadData = ({ id, account }: { id: string; account: string }) => {
        const fetchAccount = id || account;
        if (!fetchAccount) {
            return;
        }
        this.nftVisible = false;
        this.roomType = 'owner';
        this.isBacked = false;
        const defaultName = `${fetchAccount.slice(0, 6)}...${fetchAccount.slice(-6)}`;
        if (this.address !== fetchAccount) {
            this.room = {
                name: defaultName,
                avatar: '',
                description: '',
            };
            this.nfts = [];
        }
        this.address = fetchAccount;

        const chain = utils.getChainKey();
        walleApi.getWalletInfo(fetchAccount, chain).then(({ address, nfts }) => {
            console.log(address, nfts);
            if (this.address !== address) {
                return;
            }
            const data: INft[] = [];
            if (nfts && nfts.length > 0) {
                nfts.forEach((item: any) => {
                    if (item.metadata || item.token_uri) {
                        const currentMetaData = JSON.parse(item.metadata)
                        const imageUrl = ipfs.getUrl(currentMetaData?.image_url || currentMetaData?.image || item.token_uri);
                        if (imageUrl) {
                            data.push({
                                name: currentMetaData?.name || item.name,
                                description: currentMetaData?.description || 'no description',
                                imageUrl,
                                tokenAddress: item.token_address,
                                tokenId: item.token_id,
                            });
                        }
                    }
                });
            }
            this.nfts = data;
        });

        rss3.getProfile(fetchAccount).then(
            action((accountInfo) => {
                this.room = {
                    name: accountInfo.name || `${this.address.slice(0, 6)}...${this.address.slice(-6)}`,
                    description: accountInfo.bio,
                    avatar: accountInfo.avatar?.length > 0 ? accountInfo.avatar[0] : '',
                };
            })
        );

        this.avatarList = [];
        rss3.getFollowerList(fetchAccount).then(
            action((profileList) => {
                this.avatarList = profileList || [];
            })
        );
    };

    @computed get followingAvatarList() {
        const avatarUrls: { avatar: string }[] = [];
        this.avatarList.forEach((person) => {
            if (person?.avatar?.length > 0) {
                avatarUrls.push({ avatar: person.avatar[0] });
            }
        });
        return avatarUrls;
    }

    @action
    clearData = () => {
        this.nftVisible = false;
    };

    @action
    handleRoomTypeSwitch = (value: 'owner' | 'room') => {
        this.roomType = value;
    };

    @action
    handleNftClick = (item: INft) => {
        nftStore.initData(item, { ...this.room, address: this.address });
        this.nftVisible = true;
    };

    @action
    onNftBack = () => {
        this.nftVisible = false;
    };

    @action
    onBackClick = () => {
        this.isBacked = true;
    };

    @action
    onClaimClick = () => {
        message.success('Claimed');
    };
}

export default new RoomStore();
