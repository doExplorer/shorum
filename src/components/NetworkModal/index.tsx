import React from 'react';
import { Modal, Button } from 'antd';
import './style.less';

export default function NetworkModal(props: { onCancel: () => void; networkError: string }) {
    const { onCancel, networkError } = props;
    return (
        <Modal
            footer={null}
            visible
            wrapClassName="network-modal"
            onCancel={() => {
                onCancel();
            }}>
            <div>Please switch network to {networkError}</div>
            <Button className="btn-blue" onClick={() => onCancel()}>
                OK
            </Button>
        </Modal>
    );
}
