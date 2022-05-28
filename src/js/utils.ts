import 'element-closest-polyfill';

import mainStore from './main.tore';

// 修复 Windows10 上对是否支持触摸事件的误判
const isTouchSupported = 'ontouchstart' in document.documentElement && !window.navigator.userAgent.includes('Windows');

class Utils {
    public isTouchSupported = isTouchSupported;

    public TouchStart = isTouchSupported ? 'touchstart' : 'mousedown';

    public TouchMove = isTouchSupported ? 'touchmove' : 'mousemove';

    public TouchEnd = isTouchSupported ? 'touchend' : 'mouseup';

    public TouchLeave = isTouchSupported ? 'touchleave' : 'mouseleave';

    public isTouchEvent(e: Event): e is TouchEvent {
        // 企业微信内置浏览器中缺少`TouchEvent`对象
        return !(e instanceof MouseEvent);
    }

    public stop(e: Event | React.SyntheticEvent) {
        e.stopPropagation();
    }

    public prevent(e: Event | React.SyntheticEvent) {
        e.preventDefault();
    }

    /**
     * 从当前节点开始向上遍历，直到找到符合指定选择器的节点为止，并返回
     * @param node 当前节点
     * @param selector 选择器
     * @description `Element.closest`支持度还不是特别好，我们通过引入`element-closest-polyfill`解决兼容性问题。因为该方法返回`Element`类型而操作不便（比如没有`dataset`属性），因此我们提供了返回`HTMLElement`类型的`utils.closest`方法。
     */
    public closest(node: HTMLElement | EventTarget, selector: string): HTMLElement {
        return (node as HTMLElement).closest(selector);
    }

    public setChain = mainStore.setChain;

    public getChain = mainStore.getChain;

    public getChainKey = mainStore.getChainKey;

    public getChainTheme = mainStore.getChainTheme;

    /**
     * 将任意输入转成Promise对象
     * 适合用在开发组件过程中，使用后就很容易地让一个属性支持三种类型：数值，函数和返回Promise对象的函数
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public promisify(value: any): Promise<any> {
        if (typeof value === 'function') {
            value = value();
        }
        if (!value || typeof value.then !== 'function') {
            value = Promise.resolve(value);
        }
        return value;
    }
}

export default new Utils();
