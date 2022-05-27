import classnames from 'classnames';
import React, { PureComponent } from 'react';
import { TouchMouseEvent } from '../Touchable/interface';
import Touchable, { ITouchableData } from '../Touchable';
import utils from '@/js/utils';
import './style.less';

export type IStatus = 'high' | 'short' | 'both';

export const defaultStatus: IStatus = 'high';

interface IFlexibleHeaderProps {
    highHeader: React.ReactNode;
    shortHeader: React.ReactNode;
    onChange?: (status: IStatus) => void;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
interface IState {
    top: number;
    status: 'high' | 'short' | 'both';
    opacity: number;
    headHeight: number;
}

class FlexibleHeader extends PureComponent<IFlexibleHeaderProps, IState> {
    constructor(props: IFlexibleHeaderProps) {
        super(props);
        this.state = {
            top: 0,
            status: defaultStatus,
            opacity: 1,
            headHeight: 0,
        };
    }

    private head = React.createRef<HTMLDivElement>();

    private body = React.createRef<HTMLDivElement>();

    private getComputedTop = (elem: Element) => {
        return parseInt(window.getComputedStyle(elem).top, 10);
    };

    private getComputedHeight = (elem: Element) => {
        return parseInt(window.getComputedStyle(elem).height, 10);
    };

    private handleStatusChange = (status: IStatus) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(status);
        }
    };

    public onTouchStart = (e: TouchMouseEvent, data: ITouchableData) => {
        data.extra.top = this.getComputedTop(this.body.current);
        data.extra.headHeightOri = this.getComputedHeight(this.head.current);
        data.extra.headHeightMax = this.getComputedHeight(this.head.current.firstElementChild);
        data.extra.headHeightMin = this.getComputedHeight(this.head.current.lastElementChild);
        const headHeight = data.extra.headHeightOri;
        const opacity = this.getOpacity(headHeight, data);
        this.setState({ opacity, headHeight });
    };

    public onTouchMove = (e: TouchMouseEvent, data: ITouchableData) => {
        const { headHeightOri, headHeightMin } = data.extra;
        let { status, headHeight, top } = this.state;
        if (data.deltaY < 0) {
            // 向上滑动，首先调整头部高度，然后按需调整主体偏移
            headHeight = Math.round(Math.max(headHeightOri + data.deltaY, headHeightMin));
            top = Math.round(data.extra.top + headHeightOri + data.deltaY - headHeight);
            status = headHeight > headHeightMin ? 'both' : 'short';
        } else {
            // 向下滑动，首先调整主体偏移，然后按需调整头部高度
            top = Math.round(Math.min(data.extra.top + data.deltaY, 0));
            headHeight = Math.round(headHeightOri + data.deltaY + data.extra.top - top);
            status = headHeight > headHeightMin ? 'both' : 'short';
        }
        const opacity = this.getOpacity(headHeight, data);
        this.setState({ top, status, opacity, headHeight });
        this.handleStatusChange(status);
    };

    public onTouchEnd = (e: TouchMouseEvent, data: ITouchableData) => {
        const { headHeightMax, headHeightMin } = data.extra;
        let { status, headHeight, top } = this.state;
        if (headHeight * 2 > headHeightMax + headHeightMin) {
            top = 0;
            status = 'high';
            headHeight = headHeightMax;
        } else {
            const outer = utils.closest(e.target, '.gui-flexible-header');
            const inner = this.getComputedHeight(outer) - headHeightMin;
            top = Math.max(top, inner - this.getComputedHeight(this.body.current));
            status = 'short';
            headHeight = headHeightMin;
        }
        const opacity = this.getOpacity(headHeight, data);
        this.setState({ top, status, opacity, headHeight });
        this.handleStatusChange(status);
    };

    public render() {
        const { highHeader, shortHeader, children } = this.props;
        const { top, status, opacity, headHeight } = this.state;
        const style = {
            head: headHeight ? { flexBasis: `${headHeight}px` } : undefined,
            body: { top: `${top}px` },
            high: { opacity },
            short: { opacity: 1 - opacity },
        };
        return (
            <Touchable
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchEnd={this.onTouchEnd}
                className={classnames('gui-flexible-header', this.props.className)}>
                <div className={classnames('flexible-head', status)} style={style.head} ref={this.head}>
                    <div style={style.high}>{highHeader}</div>
                    <div style={style.short}>{shortHeader}</div>
                </div>
                <div className="flexible-body">
                    <div style={style.body} ref={this.body}>
                        {children}
                    </div>
                </div>
            </Touchable>
        );
    }

    private getOpacity(headHeight: number, data: ITouchableData) {
        const { headHeightMax, headHeightMin } = data.extra;
        return (headHeight - headHeightMin) / (headHeightMax - headHeightMin);
    }
}

export default FlexibleHeader;
