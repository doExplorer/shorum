import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Form, Checkbox, Button, Input } from 'antd';
import { useWallet } from 'use-wallet';
import ModuleContainer from 'components/ModuleContainer';

import './style.less';

import store from './store';

const Invite = observer(function () {
    const { options } = store;
    const wallet = useWallet();
    const { account } = wallet;

    useEffect(() => {
        store.loadData(account);
    }, [account]);

    const onFinish = (values: { inviteValue: string[] }) => {
        console.log('Success:', values);

        store.onInvite(values.inviteValue);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <ModuleContainer className="invite-page common-container">
            <Form
                className="invite-form"
                name="invite"
                layout="vertical"
                colon={false}
                initialValues={{}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off">
                <div className="invite-form-body">
                    <Form.Item label="Do you want to invite some backers?" name="inviteValue">
                        <Checkbox.Group className="invite-list" options={options} />
                    </Form.Item>
                </div>
                <div className="invite-form-footer">
                    <Button type="primary" htmlType="submit" size="large">
                        Invite
                    </Button>
                </div>
            </Form>
        </ModuleContainer>
    );
});

export default Invite;
