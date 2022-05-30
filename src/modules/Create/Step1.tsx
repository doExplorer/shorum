import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Button } from 'antd';
import { RcFile } from 'antd/lib/upload';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import useLensHubContract from 'contract/useLensHubContract';
import ModuleContainer from 'components/ModuleContainer';
import ipfs from '@/js/ipfs';

import './style.less';

import store from './store';

const Step1 = observer(function ({ onNext }: { onNext: () => void }) {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(store.roomInfo.avatar);
    const lensHubContract = useLensHubContract();

    const formItemLayout = {
        labelCol: {
            xs: { span: 12 },
        },
        wrapperCol: {
            xs: { span: 12 },
        },
    };

    const normFile = (e: any) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const upload = ({
        file,
        onSuccess,
        onError,
    }: {
        onProgress?: (event: { percent: number }) => void;
        onError?: (event: Error, body?: Object) => void;
        onSuccess?: (body: Object) => void;
        filename?: String;
        file: string | RcFile | Blob;
    }) => {
        ipfs.upload(file as any as File)
            .then((url) => {
                onSuccess({ url });
            })
            .catch((e) => {
                onError(e);
            });
    };

    const onChange = (info: any) => {
        console.log('info', info);
        if (info.file.status === 'done') {
            setAvatarUrl(info.file.response?.url);
        }
    };

    const onFinish = async (values: any) => {
        console.log('Success:', values);

        values.avatar = avatarUrl;
        store.saveData(values);

        onNext();
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const checkNameValid = async (value: string) => {
        const result: any = await lensHubContract.getProfileIdByHandle(value);
        console.log('profile id is', result, typeof result, !result);
        return result === '0';
    };

    const profileNameValidator = async (_: any, value: any) => {
        console.log(_, value);
        const isValid: boolean = await checkNameValid(value);
        if (isValid) {
            return Promise.resolve();
        }
        return Promise.reject();
    };

    const uploadButton = <div>{uploading ? <LoadingOutlined /> : <PlusOutlined />}</div>;

    return (
        <ModuleContainer className="create-page common-container" title="Step1">
            <Form
                className="page-form"
                name="step1"
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
                        label="Choose a handle for your shorum"
                        name="name"
                        rules={[
                            { required: true, message: 'Please input your shorum name!' },
                            { message: 'Profile name already taken', validator: profileNameValidator },
                        ]}>
                        <Input bordered={false} placeholder="Please input your shorum name" />
                    </Form.Item>

                    <Form.Item
                        name="avatarUrl"
                        label="Choose a picture for your backer NFT"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: 'Please upload a picture!' }]}>
                        <Upload
                            name="avatarUrl"
                            customRequest={upload}
                            listType="picture-card"
                            showUploadList={false}
                            onChange={onChange}>
                            {avatarUrl ? (
                                <img src={ipfs.getUrl(avatarUrl)} alt="avatar" style={{ width: '100%' }} />
                            ) : (
                                uploadButton
                            )}
                        </Upload>
                    </Form.Item>

                    {/* <Form.Item name="description" label="Add a description for your shorum">
                        <Input bordered={false} placeholder="Please input a description" />
                    </Form.Item> */}

                    <Form.Item
                        name="backFee"
                        label="Choose a minimun back fee (in WMATIC)"
                        rules={[{ required: true, message: 'Please input back fee!' }]}>
                        <Input bordered={false} placeholder="Please choose a back fee (in WMATIC)" />
                    </Form.Item>
                </div>
                <div className="page-form-footer">
                    <Button type="primary" htmlType="submit" size="large">
                        Next
                    </Button>
                    {/* <Button type="primary" htmlType="submit" size="large">
                        Submit
                    </Button> */}
                </div>
            </Form>
        </ModuleContainer>
    );
});

export default Step1;
