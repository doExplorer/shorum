import React from 'react';
import { observer } from 'mobx-react';

import './style.less';

const Label = observer(function ({ value, store }: { value: string; store: { [name: string]: any } }) {
    const { avatar } = store.profileMapping.get(value) || {};
    return (
        <div className="person-label">
            <div className="avatar avatar-default" style={avatar ? { backgroundImage: `url(${avatar})` } : undefined} />
            {value}
        </div>
    );
});

export default Label;
