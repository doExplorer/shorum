import { observable, action, computed } from 'mobx';
import { tradeChainMapping } from 'config';
import utils from 'utils';
import ipfs from '@/js/ipfs';
import { INft } from '../interface';

class RoomStore {
    @observable data: INft = null;

    @observable onwer = {
        name: 'Kate520',
        avatar: 'ipfs://QmQR83nhwb63sAiaKRKcAYo5hRm63GW8mqqVWTnyurjgFS',
    };

    @computed get avatarUrl() {
        if (!this.onwer || !this.onwer.avatar) {
            return '';
        }
        return ipfs.getUrl(this.onwer.avatar);
    }

    @action
    initData = (data: INft) => {
        this.data = data;
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
