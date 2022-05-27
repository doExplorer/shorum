import { observable, action } from 'mobx';
import hashHistory from 'hash-history';

class InviteStore {
    @observable options = [
        { label: 'Apple', value: 'Apple' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange' },
    ];

    @action
    onInvite = (inviteValue: string[]) => {
        hashHistory.push('/room');
    };
}

export default new InviteStore();
