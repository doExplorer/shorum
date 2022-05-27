import React from 'react';
import classNames from 'classnames';
import AppHeader from 'components/AppHeader';

import './style.less';

export default function PageModule({ className, children }: { className?: string; children?: React.ReactNode }) {
    return (
        <div className={classNames('page-module', className)}>
            <AppHeader />
            {children}
        </div>
    );
}
