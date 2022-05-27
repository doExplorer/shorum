// @ts-ignore
import { subscribe } from '@nextcloud/event-bus';
import { watchTransaction } from 'lib/utils';

async function listen(txHash: string, desc?: any) {
    return new Promise((resolve, reject) => {
        const previousActionObj: { [name: string]: any } = JSON.parse(localStorage.getItem('actionObj')) || {};
        previousActionObj[txHash] = {
            desc,
        };
        localStorage.setItem('actionObj', JSON.stringify(previousActionObj));

        subscribe(txHash, (val: any) => {
            resolve(val);
        });

        watchTransaction(txHash);
    });
}

export default {
    listen,
};
