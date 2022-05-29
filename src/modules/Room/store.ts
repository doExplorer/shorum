import { observable, action, computed } from 'mobx';
import { message } from 'antd';
import utils from 'utils';
import $axios from '$axios';
import ipfs from '@/js/ipfs';
import rss3 from '@/js/rss3';
import walleApi from '@/js/wallet';
import { IRoom } from '../Create/interface';
import { INft } from './interface';
import nftStore from './Nft/store';

class RoomStore {
    @observable address = '0x4700F51B1FEfF74Df41BED9C31D0b2e5662d35b8';

    @observable room: IRoom = {
        name: 'Kate520’s Shorum',
        avatar: 'ipfs://QmQR83nhwb63sAiaKRKcAYo5hRm63GW8mqqVWTnyurjgFS',
        description: 'That’s my description right here',
        backer: 2,
        rate: 20,
        fee: 0.1,
    };

    @observable nfts: INft[] = [];

    @observable balance = 0.3068438025035108;

    @observable avatarList: {
        name?: string;
        avatar?: string[];
        bio?: string;
        accounts?: {
            tags?: string[];
            id: string;
            signature?: string;
        }[];
    }[] = [];

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
                    if (item.metadata) {
                        const currentMetaData = JSON.parse(item.metadata);
                        const imageUrl = ipfs.getUrl(currentMetaData.image_url || currentMetaData.image);
                        if (imageUrl) {
                            data.push({
                                name: currentMetaData.name,
                                description: currentMetaData.description,
                                imageUrl,
                            });
                        }
                    }
                });
            }
            this.nfts = data;
        });

        this.avatarList = [];
        rss3.getFollowerList(fetchAccount).then(
            action((profileList) => {
                this.avatarList = profileList || [];
            })
        );
    };

    @computed get followingAvatarList() {
        return this.avatarList.map((person) => {
            return { avatar: person.avatar[0] };
        });
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
        nftStore.initData(item);
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
