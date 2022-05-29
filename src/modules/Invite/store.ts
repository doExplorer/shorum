import { observable, action } from 'mobx';
import hashHistory from 'hash-history';
import walleApi from '@/js/wallet';

class InviteStore {
    @observable options: {
        label: string;
        value: string;
    }[] = [];

    @action
    loadData = (address: string) => {
        if (!address) {
            return;
        }
        walleApi.getRelatedAddress(address).then(
            action((result) => {
                this.options = (result?.data || []).map((addressInfo) => {
                    return {
                        label: addressInfo.address,
                        value: addressInfo.address,
                    };
                });
            })
        );
    };

    @action
    onInvite = (inviteValue: string[]) => {
        hashHistory.push('/room');
    };
}

export default new InviteStore();
