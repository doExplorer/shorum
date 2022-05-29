import { observable, action, computed } from 'mobx';
import { tradeChainMapping } from 'config';
import utils from 'utils';
import ipfs from '@/js/ipfs';
import { INft } from '../interface';

interface IOwner {
    name: string;
    avatar: string;
    description: string;
    address: string;
}

class RoomStore {
    @observable data: INft = null;

    @observable owner: IOwner | null = null;

    @computed get avatarUrl() {
        if (!this.owner || !this.owner.avatar) {
            return '';
        }
        return ipfs.getUrl(this.owner.avatar);
    }

    @action
    initData = (data: INft, owner: IOwner) => {
        this.data = data;
        this.owner = owner;
    };

    @computed get isBuyVisible() {
        return !!(tradeChainMapping as { [key: number]: string })[utils.getChain()];
    }

    @action
    onBuy = () => {
        const chainKey = (tradeChainMapping as { [key: number]: string })[utils.getChain()];
        const { tokenAddress, tokenId } = this.data;
        window.open(`https://opensea.io/assets/${chainKey}/${tokenAddress}/${tokenId}`);
    };
}

export default new RoomStore();
