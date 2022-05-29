import { observable, action } from 'mobx';
import hashHistory from 'hash-history';
import { IRoom } from './interface';

class CreateStore {
    @observable roomInfo: IRoom = {
        name: '',
        avatar: '',
        description: '',
        backer: null,
        rate: null,
        fee: null,
    };

    @action
    saveData = (info: {
        name?: string;
        avatar?: string;
        description?: string;
        backer?: number;
        rate?: number;
        fee?: number;
    }) => {
        Object.assign(this.roomInfo, info);
    };

    @action
    clearData = () => {
        this.roomInfo = {
            name: '',
            avatar: '',
            description: '',
            backer: null,
            rate: null,
            fee: null,
        };
    };

    @action
    onSubmit = () => {
        hashHistory.push('/invite');
    };
}

export default new CreateStore();
