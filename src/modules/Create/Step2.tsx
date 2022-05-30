import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
import { observer } from 'mobx-react';
import ModuleContainer from 'components/ModuleContainer';
import useLensHubContract from 'contract/useLensHubContract';
import hashHistory from 'hash-history';

import './style.less';

import store from './store';

const Step2 = observer(function ({ onPrevious }: { onPrevious: () => void }) {
    const lensHubContract = useLensHubContract();
    const formItemLayout = {
        labelCol: {
            xs: { span: 12 },
        },
        wrapperCol: {
            xs: { span: 12 },
        },
    };

    const onFinish = async (values: any) => {
        console.log('Success:', values);

        store.saveData(values);

        console.log(store.roomInfo);

        const result: any = await lensHubContract.createProfile(store.roomInfo);
        if (result.status) {
            hashHistory.push(`/invite/${result.events.Transfer.returnValues.tokenId}`);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <ModuleContainer className="create-page common-container" title="Step2">
            <Form
                className="page-form"
                name="step2"
                {...formItemLayout}
                labelAlign="left"
                labelWrap
                colon={false}
                initialValues={store.roomInfo}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off">
                <div className="page-form-body">
                    <Form.Item
                        label="Choose a max backer you allow"
                        name="backer"
                        rules={[{ required: false, message: 'Please input a max backer you allow!' }]}>
                        <InputNumber min={0} bordered={false} placeholder="Please input a max backer you allow" />
                    </Form.Item>

                    <Form.Item
                        name="rate"
                        label="Choose a rate you want to share with your backer (%)"
                        rules={[{ required: false, message: 'Please input a max backer you allow!' }]}>
                        <InputNumber min={0} bordered={false} placeholder="Please input a max backer you allow" />
                    </Form.Item>

                    <Form.Item
                        name="fee"
                        label="Choose a min-back fee (in ETH)"
                        rules={[{ required: false, message: 'Please choose a min-back fee (in ETH)!' }]}>
                        <InputNumber
                            min={0}
                            bordered={false}
                            step={0.1}
                            placeholder="Please choose a min-back fee (in ETH)"
                        />
                    </Form.Item>
                </div>
                <div className="page-form-footer">
                    <Button type="primary" size="large" ghost onClick={onPrevious}>
                        Previous
                    </Button>
                    <Button type="primary" htmlType="submit" size="large">
                        Submit
                    </Button>
                </div>
            </Form>
        </ModuleContainer>
    );
});

export default Step2;
