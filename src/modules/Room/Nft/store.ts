import { observable, action, computed } from 'mobx';
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
}

export default new RoomStore();
