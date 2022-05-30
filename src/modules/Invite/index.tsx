import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import hashHistory from 'hash-history';
import { useParams } from 'react-router-dom';
import useFollowContract from 'contract/useFollowContract';
import { Form, Checkbox, Button, Input, Select } from 'antd';
import { useWallet } from 'use-wallet';
import Web3Utils from 'web3-utils';
import _ from 'lodash';
import utils from 'utils';
import { RuleObject } from 'rc-field-form/lib/interface';
import { MinusCircleOutlined } from '@ant-design/icons';
import ModuleContainer from 'components/ModuleContainer';
import knn3Logo from '../../assets/knn3.png';
import rss3Logo from '../../assets/rss3.png';

import './style.less';

import store from './store';

const { Option } = Select;

const Invite = observer(function () {
    const { options } = store;
    const { profileId } = useParams<{ profileId?: string }>();
    const followContract = useFollowContract();
    const wallet = useWallet();
    const { account } = wallet;
    const [form] = Form.useForm();

    useEffect(() => {
        store.loadData(account);
    }, [account]);

    const onInvite = async () => {
        store.onInvite(async (inviteList: string[]) => {
            console.log('innnn', inviteList)
            await followContract.invite(inviteList, profileId);
            console.log('ready to jump');
            hashHistory.push(`/room/${account}`);
            // return result;
        });
    };

    const handleAddAddress = (value: string) => {
        store.onAddAdress(value);
    };

    return (
        <ModuleContainer className="invite-page common-container" title="Step3">
            <Form
                form={form}
                className="invite-form"
                name="invite"
                layout="vertical"
                colon={false}
                initialValues={{}}
                autoComplete="off">
                <div className="invite-form-body">
                    <div className="powered-by">
                        <span>Powered by</span>
                        <img className="knn3-logo" src={knn3Logo} alt="" />
                        <img className="rss3-logo" src={rss3Logo} alt="" />
                    </div>
                    <div className="title">Do you want to invite some backers?</div>
                    <div className="ant-row select-box">
                        <label>Source</label>
                        <Select value={store.source} style={{ width: 120 }} onChange={store.handleSourceChange}>
                            <Option value="knn3">knn3</Option>
                            <Option value="rss3">rss3</Option>
                        </Select>
                        <If condition={store.source !== 'rss3'}>
                            <label>Algo</label>
                            <Select value={store.algo} style={{ width: 120 }} onChange={store.handleAlgoChange}>
                                <Option value="OVERLAP">OVERLAP</Option>
                                <Option value="JACCARD">JACCARD</Option>
                            </Select>
                        </If>
                    </div>
                    <Form.Item
                        name="address"
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
                                message: 'Please input an available address',
                            },
                            {
                                validator: (rule: RuleObject, value: string) => {
                                    const trimValue = _.trim(value);
                                    if (!trimValue) {
                                        return Promise.resolve();
                                    }
                                    if (store.options.find((o) => o.value === trimValue)) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                },
                                message: 'This address has been added!',
                            },
                        ]}>
                        <Input
                            placeholder="invite address"
                            style={{ width: '70%' }}
                            onPressEnter={(e: React.KeyboardEvent) => {
                                e.preventDefault();

                                const trimValue = _.trim((e.target as HTMLInputElement).value);
                                if (trimValue) {
                                    if (!Web3Utils.isAddress(trimValue, utils.getChain())) {
                                        return;
                                    }
                                    if (store.options.find((o) => o.value === trimValue)) {
                                        return;
                                    }
                                    handleAddAddress(trimValue);
                                }
                                form.setFieldsValue({
                                    address: '',
                                });
                            }}
                        />
                    </Form.Item>
                    <Checkbox.Group
                        className="invite-list"
                        options={Array.from(options)}
                        value={store.checkedList}
                        onChange={store.onCheckedChange}
                    />
                </div>
                <div className="invite-form-footer">
                    <Button type="primary" size="large" onClick={onInvite}>
                        Invite
                    </Button>
                </div>
            </Form>
        </ModuleContainer>
    );
});

export default Invite;
