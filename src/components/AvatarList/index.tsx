import React from 'react';
import classNames from 'classnames';
import { Avatar } from 'antd';
import ipfs from '@/js/ipfs';

import './style.less';

const AvatarList = function ({
    className,
    options,
    avatarField,
    maxCount,
    size,
}: {
    className?: string;
    options: { [name: string]: any }[];
    avatarField: string;
    maxCount: number;
    size?: number;
}) {
    return (
        <div className={classNames('app-avatar-list', className)}>
            <Avatar.Group
                maxCount={maxCount}
                maxPopoverTrigger="click"
                size={size || 'large'}
                maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}>
                {Array.from(options, (item, index) => {
                    return <Avatar key={index} src={ipfs.getUrl(item[avatarField])} />;
                })}
            </Avatar.Group>
        </div>
    );
};

export default AvatarList;
