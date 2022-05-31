import React from 'react';
import { observable, action } from 'mobx';
import _ from 'lodash';
import Web3Utils from 'web3-utils';
import utils from 'utils';
import walletApi from '@/js/wallet';
import rss3 from '@/js/rss3';
import ipfs from '@/js/ipfs';
import Label from './Label';

function generateAccounts() {
    const addresses = [
        '0x4700F51B1FEfF74Df41BED9C31D0b2e5662d35b8',
        '0x0E9D559Bf81f7478159d8Cf6fdF37d6B62922f3e',
        '0xA6Cc4409990d7D1E06161B711A16E9f44d44Fd89',
        '0x47f7ea0dd4418aa1cec00786f5c47623ac37ba42',
        '0x2Ffee84E7e601D3Ff0603CE0a24d3bf5E2A08fB1',
        '0xFB945eE5b2E9805D66792Bd194E905f8294FBE86',
        '0x09c85610154a276a71eb8a887e73c16072029b20',
        '0x934b510d4c9103e6a87aef13b816fb080286d649',
        '0x9766a4613ce437285776241739e311a319451597',
        '0x01f252756FeDf36c8c031549afEE43765Dfcd314',
        '0x5B4CcFD90409216EE98282b914Ec594e63CC829d',
    ];
    const accounts: string[] = [];
    for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 1000);
        if (num % 2) {
            accounts.push(...addresses.splice(num % addresses.length, 1));
        } else {
            accounts.push(Web3Utils.randomHex(20));
        }
    }
    return accounts;
}

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
        if (this.address === address) {
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
                    let options = (result?.data || []).slice(0, 10).map((addressInfo) => {
                        const { address: relatedAddress } = addressInfo;
                        addressList.push(relatedAddress);
                        return {
                            label: <Label value={relatedAddress} store={this} />,
                            value: relatedAddress,
                        };
                    });
                    if (options.length === 0) {
                        // generate account if not get
                        const accounts = generateAccounts();
                        options = accounts.map((account) => {
                            addressList.push(account);
                            return {
                                label: <Label value={account} store={this} />,
                                value: account,
                            };
                        });
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
