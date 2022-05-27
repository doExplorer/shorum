import React from 'react';
import classNames from 'classnames';

import './style.less';

const Card = function ({
    imageUrl,
    className,
    onClick,
}: {
    imageUrl: string;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <div className={classNames('show-card', className)}>
            <div className="card-box">
                <div className="card" style={{ backgroundImage: `url(${imageUrl})` }} onClick={onClick} />
            </div>
        </div>
    );
};

export default Card;
