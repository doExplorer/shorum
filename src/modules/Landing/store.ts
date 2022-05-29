import { observable, action } from 'mobx';
import _ from 'lodash';
import $axios from '$axios';
import ipfs from '@/js/ipfs';
import rss3 from '@/js/rss3';
import { IPerson } from './interface';

class LandingStore {
    @observable personList: IPerson[] = [];

    addresses = [
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

    @action
    loadData = () => {
        rss3.getProfileList(this.addresses).then(
            action((persons) => {
                const profileMapping = _.keyBy(persons, 'persona');
                const profileList = this.addresses.map((address) => {
                    const profile = profileMapping[address];
                    const person: IPerson = {
                        name: 'not loaded with a bio',
                        avatar: '',
                        description: '',
                        address,
                        followers: [],
                    };
                    if (profile) {
                        Object.assign(person, {
                            name: profile.name || '',
                            avatar: profile.avatar?.length > 0 ? profile.avatar[0] : '',
                            description: profile.bio,
                        });
                    }
                    person.avatar = person.avatar ? ipfs.getUrl(person.avatar) : '';
                    return person;
                });
                this.personList = profileList;
                this.personList.forEach((person) => {
                    rss3.getFollowerList(person.address).then((data) => {
                        person.followers = (data || []).map((item) => {
                            let avatar = '';
                            if (item.avatar?.length > 0) {
                                avatar = ipfs.getUrl(item.avatar[0]);
                            }
                            return {
                                avatar,
                            };
                        });
                    });
                });
            })
        );
    };
}

export default new LandingStore();
