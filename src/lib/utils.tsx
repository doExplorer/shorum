import React from 'react';
import { notification } from 'antd';
import { web3 } from 'lib/web3';
import mm from 'lib/mm';
// @ts-ignore
import { emit } from '@nextcloud/event-bus';
import { CheckOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';

const sleep = (ms: number) => {
    // Unit is ms
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
};

function getTransactionReceiptPromise(hash: string) {
    // here we just promisify getTransactionReceipt function for convenience
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(hash, function (err, data) {
            // console.log(err, data, "get receipt");
            if (err !== null) reject(err);
            else resolve(data);
        });
    });
}

const getTxReceipt = async (txHash: string) => {
    const receipt = await getTransactionReceiptPromise(txHash);
    return receipt;
};

const watchTransaction = async (txHash: string) => {
    const actionObj = JSON.parse(localStorage.getItem('actionObj'));
    const currentAction = actionObj[txHash];
    const msgTitle = 'Waiting for confirmation';
    if (currentAction) {
        notification.info({
            message: msgTitle,
            description: currentAction.desc,
            icon: <LoadingOutlined style={{ color: 'blue' }} />,
            className: txHash,
            duration: null,
        });

        let receipt: { [name: string]: any } = null;
        while (receipt === null) {
            // eslint-disable-next-line no-await-in-loop
            receipt = await getTransactionReceiptPromise(txHash);
            // eslint-disable-next-line no-await-in-loop
            await sleep(1000);
        }

        if (receipt) {
            if (receipt.status) {
                emit(txHash, true);

                notification.success({
                    message: 'Success',
                    description: `${currentAction.desc}. Tx hash: ${txHash}`,
                    icon: <CheckOutlined style={{ color: 'green' }} />,
                });
                // trigger approved action
                if (currentAction.action) {
                    // mm.sendTransaction(currentAction.action);
                }
            } else {
                emit(txHash, false);
                notification.error({
                    message: 'Failed',
                    description: currentAction.desc,
                    icon: <CloseCircleOutlined style={{ color: 'red' }} />,
                });
            }
            // remove obj from localstorage
            const latestObj = JSON.parse(localStorage.getItem('actionObj'));
            delete latestObj[txHash];
            localStorage.setItem('actionObj', JSON.stringify(latestObj));
            // remove notification
            if (document.getElementsByClassName(txHash)) {
                (document.getElementsByClassName(txHash)[0] as HTMLElement).style.display = 'none';
            }
        }
    } else {
        console.log('did not find txn');
    }
};

export { watchTransaction, getTxReceipt };
