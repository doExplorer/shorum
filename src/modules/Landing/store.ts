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
        '0xFB945eE5b2E9805D66792Bd194E905f8294FBE86',
        '0x2Ffee84E7e601D3Ff0603CE0a24d3bf5E2A08fB1',
        '0xaf49A257A6C66b509916aE316358cf83b3f17D49',
        '0x2Df184f4F3d9dA634e4E30c64DfF848585e863Ce',
        '0xc8f8e2F59Dd95fF67c3d39109ecA2e2A017D4c8a',
        '0x19Eb7FfDcD670Ca917110Bd032463120a5E58C8E',
        '0x4700F51B1FEfF74Df41BED9C31D0b2e5662d35b8',
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
