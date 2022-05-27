import React from 'react';

import './style.less';

interface ModuleWrapperProps {
    className?: string;
    children?: React.ReactNode;
}

export default class ModuleWrapper extends React.Component<ModuleWrapperProps> {
    static defaultProps = {
        className: '',
    };

    render(): React.ReactNode {
        const { className } = this.props;

        return <div className={`module-wrapper ${className}`}>{this.props.children}</div>;
    }
}
