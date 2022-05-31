import React from 'react';
import { observable, action } from 'mobx';
import _ from 'lodash';
import Web3Utils from 'web3-utils';
import utils from 'utils';
import walletApi from '@/js/wallet';
import rss3 from '@/js/rss3';
import ipfs from '@/js/ipfs';
import Label from './Label';

class InviteStore {
    @observable options: {
        label: React.ReactNode;
        value: string;
    }[] = [];

    @observable address = '';

    @observable source = 'knn3';

    @observable algo = 'OVERLAP';

    @observable checkedList: string[] = [];

    @observable profileMapping = observable.map<string, { avatar: string }>({});

    @action
    getProfileList = async (addressList: string[]) => {
        const fetchAddressList = addressList.filter((address) => {
            return !this.profileMapping.get(address);
        });
        if (!fetchAddressList.length) {
            return;
        }
        const profileList = await rss3.getProfileList(addressList);
        profileList.forEach((profile) => {
            if (profile?.avatar?.length > 0) {
                this.profileMapping.set(profile.persona, {
                    avatar: ipfs.getUrl(profile.avatar[0]),
                });
            }
        });
    };

    @action
    loadData = (address: string) => {
        if (!address) {
            return;
        }
        this.address = address;
        this.loadRelatedAddress();
    };

    @action
    loadRelatedAddress = () => {
        walletApi.getRelatedAddress(this.address, this.source, this.algo).then(
            action((result) => {
                const addressList: string[] = [];
                this.options = (result?.data || []).map((addressInfo) => {
                    const { address: relatedAddress } = addressInfo;
                    addressList.push(relatedAddress);
                    return {
                        label: <Label value={relatedAddress} store={this} />,
                        value: relatedAddress,
                    };
                });
                this.getProfileList(addressList);
            })
        );
    };

    @action
    handleSourceChange = (value: string) => {
        this.source = value;
        this.loadRelatedAddress();
    };

    @action
    handleAlgoChange = (value: string) => {
        this.algo = value;
        this.loadRelatedAddress();
    };

    @action
    onInvite = async (callback: (invites: string[]) => Promise<void>) => {
        const inviteList = this.checkedList;
        if (inviteList.length > 0) {
            await callback(inviteList);
        }
    };

    @action
    onAddAddress = (value: string) => {
        this.options.unshift({
            value,
            label: <Label value={value} store={this} />,
        });
        this.checkedList.unshift(value);
        this.getProfileList([value]);
    };

    @action
    onCheckedChange = (checkedList: string[]) => {
        this.checkedList = checkedList;
    };
}

export default new InviteStore();
