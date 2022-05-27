import _ from 'lodash';
import React, { PureComponent } from 'react';
import { TouchMouseEvent } from './interface';
import utils from '@/js/utils';

export type ITouchableData = {
    deltaX: number;
    deltaY: number;
    pageX: number;
    pageY: number;
    durationX: number;
    durationY: number;
    /** 允许用户写入数据 */
    extra: {
        [key: string]: any;
    };
};

interface ITouchableProps {
    /** 手指放到触摸屏上时触发的事件 */
    onTouchStart?: (e: TouchMouseEvent, data: ITouchableData) => void;
    /** 手指在触摸屏上拖动时触发的事件 */
    onTouchMove?: (e: TouchMouseEvent, data: ITouchableData) => void;
    /** 手指离开触摸屏时触发的事件 */
    onTouchEnd?: (e: TouchMouseEvent, data: ITouchableData) => void;
    /** 滚动事件 */
    onWheel?: React.WheelEventHandler;
    /** 手指是否还在触摸屏上移动 */
    keepMoving?: boolean;
    /** 计算拖动距离及时间时的系数 */
    acceleration?: number;
    /** 是否禁用该功能 */
    disabled?: boolean;
    /** 是否从右往左显示，如果是，则 deltaX 返回 -deltaX */
    rtl?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default class Touchable extends PureComponent<ITouchableProps> {
    static defaultProps = {
        onTouchStart: _.noop,
        onTouchMove: _.noop,
        onTouchEnd: _.noop,
        keepMoving: false,
        acceleration: 0.001,
        disabled: false,
    };

    container = React.createRef<HTMLDivElement>();

    isTouching = false;

    componentDidMount() {
        this.container.current.addEventListener(utils.TouchStart, this.onTouchStart, { passive: false });
    }

    componentWillUnmount() {
        this.container.current.removeEventListener(utils.TouchStart, this.onTouchStart);
    }

    getPageX = (e: TouchMouseEvent) => {
        /** touchend 事件 touches 长度为0 */
        return e instanceof MouseEvent ? e.pageX : (e.touches[0] || e.changedTouches[0]).pageX;
    };

    getPageY = (e: TouchMouseEvent) => {
        return e instanceof MouseEvent ? e.pageY : (e.touches[0] || e.changedTouches[0]).pageY;
    };

    getIdentifier = (e: TouchMouseEvent) => {
        return utils.isTouchEvent(e) ? e.targetTouches[0].identifier : 1;
    };

    getScrollDistanceAndDuration = (touchDistance: number, touchDuration: number) => {
        const { acceleration } = this.props;
        // 在企业微信中通过鼠标点击时，touchDuration为0
        const speed = touchDuration === 0 ? 0 : touchDistance / touchDuration;
        const distance = ((speed * speed) / 2 / acceleration) * (touchDistance > 0 ? 1 : -1);
        const duration = Math.abs(speed / acceleration);
        return [distance, duration];
    };

    onTouchStart = (e1: TouchMouseEvent) => {
        if (this.isTouching || this.props.disabled) {
            return;
        }
        this.isTouching = true;
        const identifier = this.getIdentifier(e1);
        const pageX = this.getPageX(e1);
        const pageY = this.getPageY(e1);
        const { timeStamp } = e1;
        /** 通过`data`在各个`touch`事件之间传递自定义数据 */
        const data: ITouchableData = {
            deltaX: 0,
            deltaY: 0,
            pageX,
            pageY,
            durationX: 0,
            durationY: 0,
            /** 允许用户写入数据 */
            extra: {},
        };
        this.props.onTouchStart(e1, data);

        const onTouchMove = (e: TouchMouseEvent) => {
            if (identifier !== this.getIdentifier(e)) {
                return;
            }
            /** 计算当前位置和移动距离 */
            data.pageX = this.getPageX(e);
            data.pageY = this.getPageY(e);
            data.deltaX = data.pageX - pageX;
            data.deltaY = data.pageY - pageY;
            if (this.props.rtl) {
                data.deltaX = -data.deltaX;
            }
            this.props.onTouchMove(e, data);
        };

        const onTouchEnd = (e: TouchMouseEvent) => {
            this.isTouching = false;
            /** 计算当前位置和移动距离 */
            data.pageX = this.getPageX(e);
            data.pageY = this.getPageY(e);
            data.deltaX = data.pageX - pageX;
            data.deltaY = data.pageY - pageY;
            if (this.props.keepMoving) {
                /** 计算滑动距离 */
                const duration = e.timeStamp - timeStamp;
                const [distanceX, durationX] = this.getScrollDistanceAndDuration(data.deltaX, duration);
                const [distanceY, durationY] = this.getScrollDistanceAndDuration(data.deltaY, duration);
                data.pageX += distanceX;
                data.pageY += distanceY;
                data.deltaX += distanceX;
                data.deltaY += distanceY;
                data.durationX = durationX;
                data.durationY = durationY;
            }
            if (this.props.rtl) {
                data.deltaX = -data.deltaX;
            }
            document.body.removeEventListener(utils.TouchMove, onTouchMove);
            document.body.removeEventListener(utils.TouchEnd, onTouchEnd);
            document.body.removeEventListener(utils.TouchLeave, onTouchEnd);
            document.body.removeEventListener('contextmenu', utils.prevent);
            this.props.onTouchEnd(e, data);
        };
        document.body.addEventListener(utils.TouchMove, onTouchMove, { passive: false });
        document.body.addEventListener(utils.TouchEnd, onTouchEnd, { passive: false });
        document.body.addEventListener(utils.TouchLeave, onTouchEnd, { passive: false });
        document.body.addEventListener('contextmenu', utils.prevent);
    };

    render() {
        const { onTouchStart, onTouchMove, onTouchEnd, keepMoving, acceleration, disabled, rtl, ...props } = this.props;
        return <div {...props} ref={this.container} />;
    }
}
