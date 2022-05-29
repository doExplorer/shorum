import { observable, action } from 'mobx';
import _ from 'lodash';
import $axios from '$axios';
import ipfs from '@/js/ipfs';
import rss3 from '@/js/rss3';
import { IPerson } from './interface';

class LandingStore {
    @observable personList: IPerson[] = [];

    addresses = [
        '0x0A6F3896f60b30F81762BDdb640a800FBCD83a29',
        '0x6A797474a9B6fD30C394B1447055A40342Fc44b0',
        '0x1d4B9b250B1Bd41DAA35d94BF9204Ec1b0494eE3',
        '0x1e299DC52EB9fDAB6A6849f9731a948D8D72e474',
        '0x5F2Bdf26F6528cE05AAC77D7fa52bac7A836eF66',
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
