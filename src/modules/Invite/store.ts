import { observable, action } from 'mobx';
import _ from 'lodash';
import hashHistory from 'hash-history';
import Web3Utils from 'web3-utils';
import utils from 'utils';
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
    onInvite = ({ inviteValue, addresses }: { inviteValue: string[]; addresses: string[] }) => {
        const availableAddress: string[] = [];
        (addresses || []).forEach((address) => {
            const trimValue = _.trim(address);
            if (Web3Utils.isAddress(trimValue, utils.getChain())) {
                availableAddress.push(trimValue);
            }
        });
        const inviteList: string[] = [];
        if (inviteValue) {
            inviteList.push(...inviteValue);
        }
        inviteList.push(...availableAddress);
        console.log('inviteList', inviteList);
        hashHistory.push('/room');
    };
}

export default new InviteStore();
