import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { useWallet } from 'use-wallet';
import Web3Utils from 'web3-utils';
import { Form, Checkbox, Button, Input } from 'antd';
import utils from 'utils';
import { RuleObject } from 'rc-field-form/lib/interface';
import { MinusCircleOutlined } from '@ant-design/icons';
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

    const onFinish = (values: { inviteValue: string[]; addresses: string[] }) => {
        console.log('Success:', values);

        store.onInvite(values);
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
                    <Form.List
                        name="addresses"
                        initialValue={['']}
                        rules={[
                            {
                                validator: async (p: any, addresses: string[]) => {
                                    if (!addresses || addresses.length < 2) {
                                        return Promise.reject(new Error('At least 2 passengers'));
                                    }
                                },
                            },
                        ]}>
                        {(
                            fields: { name: number; key: number }[],
                            {
                                add,
                                remove,
                            }: {
                                add: (defaultValue?: string, insertIndex?: number) => void;
                                remove: (index: number | number[]) => void;
                            }
                        ) => (
                            <>
                                {fields.map((field, index) => (
                                    <Form.Item label="" required={false} key={field.key}>
                                        <Form.Item
                                            {...field}
                                            validateTrigger={['onChange', 'onBlur']}
                                            rules={[
                                                {
                                                    validator: (rule: RuleObject, value: string) => {
                                                        const trimValue = _.trim(value);
                                                        if (!trimValue) {
                                                            return Promise.resolve();
                                                        }
                                                        if (!Web3Utils.isAddress(trimValue, utils.getChain())) {
                                                            return Promise.reject();
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                    message: 'Please input an available address or delete this field',
                                                },
                                            ]}
                                            noStyle>
                                            <Input
                                                placeholder="invite address"
                                                style={{ width: '60%' }}
                                                onPressEnter={(e: React.KeyboardEvent) => {
                                                    e.preventDefault();

                                                    const trimValue = _.trim((e.target as HTMLInputElement).value);
                                                    if (trimValue) {
                                                        if (!Web3Utils.isAddress(trimValue, utils.getChain())) {
                                                            return;
                                                        }
                                                    }
                                                    add('', index + 1);
                                                }}
                                            />
                                        </Form.Item>
                                        {fields.length > 1 ? (
                                            <MinusCircleOutlined
                                                className="dynamic-delete-button"
                                                onClick={() => remove(field.name)}
                                            />
                                        ) : null}
                                    </Form.Item>
                                ))}
                            </>
                        )}
                    </Form.List>
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
