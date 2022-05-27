import React from 'react';
import classNames from 'classnames';

import './style.less';

export interface SwitchProps {
    /** 自定义类名 */
    className?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    /** 状态变化时的回调 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (value?: any) => void;
    /** 选中时的内容 */
    checkedChildren: React.ReactNode;
    /** 未选中时的内容 */
    unCheckedChildren: React.ReactNode;
    /** [unchecked value, checked value] */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: any[];
}

const Switch = function ({ className, value, onChange, checkedChildren, unCheckedChildren, values }: SwitchProps) {
    const onClick = (): void => {
        const newValue = value === values[0] ? values[1] : values[0];
        onChange(newValue);
    };

    const getChecked = (): boolean => {
        return value === values[1];
    };

    const isChecked = getChecked();
    const clazz = classNames('app-form-switch', className);
    return (
        <div className={clazz} onClick={onClick}>
            <label>
                <input disabled type="checkbox" checked={isChecked} />
                <div className="app-switch-inner">
                    <div className="off">{unCheckedChildren}</div>
                    <div className="on">{checkedChildren}</div>
                </div>
            </label>
        </div>
    );
};

export default Switch;
