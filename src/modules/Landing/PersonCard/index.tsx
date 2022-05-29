import React from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import AvatarList from 'components/AvatarList';
import { IPerson } from '../interface';

import './style.less';

const PersonCard = observer(function ({
    person,
    className,
    onClick,
}: {
    person: IPerson;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <div className={classNames('person-card', className)}>
            <div className="card-box">
                <div className="card" onClick={onClick}>
                    <div className="card-avatar">
                        <div
                            className="avatar avatar-default"
                            style={person.avatar ? { backgroundImage: `url(${person.avatar})` } : undefined}
                        />
                    </div>
                    <div className="card-info">
                        <div className="person-info">
                            <div className="person-name">{person.name}</div>
                            <div className="person-address">
                                <div>
                                    {person.address.slice(0, 6)}...{person.address.slice(-6)}
                                </div>
                            </div>
                            <div className="person-description">{person.description}</div>
                        </div>
                        <div className="person-follow">
                            <AvatarList options={person.followers} avatarField="avatar" maxCount={8} size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PersonCard;
