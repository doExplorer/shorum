import { observable, action } from 'mobx';
import { chainKeyMapping, chainThemeMapping } from 'config';
import { getChain as getChainId, setChain as setChainId } from './chain';

export const DefaultThemeColor = '#ffeb3';

class MainStore {
    @observable chainId: number = getChainId();

    @action
    setChain = (chainId: number) => {
        this.chainId = chainId;
        setChainId(chainId);
    };

    getChain = () => {
        return this.chainId;
    };

    getChainKey = () => {
        return (chainKeyMapping as { [key: number]: string })[this.getChain()];
    };

    getChainTheme = () => {
        return (chainThemeMapping as { [key: number]: string })[this.getChain()] || DefaultThemeColor;
    };
}

export default new MainStore();
