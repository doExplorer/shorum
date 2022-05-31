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

    @observable sourceOptionsMapping = observable.map({});

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

    getKey = (source: string, algo: string) => {
        if (source === 'rss3') {
            return source;
        }
        return `${source}@${algo}`;
    };

    @action
    loadRelatedAddress = () => {
        if (!this.address) {
            return;
        }
        // load all data
        [
            ['knn3', 'OVERLAP'],
            ['knn3', 'JACCARD'],
            ['rss3', ''],
        ].forEach(([source, algo]) => {
            walletApi.getRelatedAddress(this.address, source, algo).then(
                action((result) => {
                    const addressList: string[] = [];
                    const options = (result?.data || []).map((addressInfo) => {
                        const { address: relatedAddress } = addressInfo;
                        addressList.push(relatedAddress);
                        return {
                            label: <Label value={relatedAddress} store={this} />,
                            value: relatedAddress,
                        };
                    });
                    if (options.length === 0) {
                        // generate random account if have not
                        for (let i = 0; i < 10; i++) {
                            const randomAccount = Web3Utils.randomHex(20);
                            options.push({
                                label: <Label value={randomAccount} store={this} />,
                                value: randomAccount,
                            });
                        }
                    }
                    this.sourceOptionsMapping.set(this.getKey(source, algo), options);
                    this.options = this.sourceOptionsMapping.get(this.getKey(this.source, this.algo)) || [];
                    this.getProfileList(addressList);
                })
            );
        });
    };

    @action
    handleSourceChange = (value: string) => {
        this.source = value;
        this.options = this.sourceOptionsMapping.get(this.getKey(this.source, this.algo)) || [];
    };

    @action
    handleAlgoChange = (value: string) => {
        this.algo = value;
        this.options = this.sourceOptionsMapping.get(this.getKey(this.source, this.algo)) || [];
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
