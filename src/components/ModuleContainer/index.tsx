import React from 'react';
import classNames from 'classnames';

import './style.less';

export default function ModuleContainer({
    className,
    title,
    footer,
    children,
}: {
    className?: string;
    title?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <div className={classNames('module-container', className)}>
            <If condition={!!title}>
                <div className="app-title">{title}</div>
            </If>
            <div className="app-container">
                <div className="app-body">{children}</div>
                <If condition={!!footer}>
                    <div className="app-footer">{footer}</div>
                </If>
            </div>
        </div>
    );
}
