import { observable, action } from 'mobx';
import hashHistory from 'hash-history';

class InviteStore {
    @observable options = [
        { label: '0x80eDfd33BdD76573bDEF5Cdb37e579657476a4A5', value: '0x80eDfd33BdD76573bDEF5Cdb37e579657476a4A5' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange' },
    ];

    @action
    onInvite = (inviteValue: string[]) => {
        hashHistory.push('/room');
    };
}

export default new InviteStore();
