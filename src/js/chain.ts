let chainId: number;

const CHAIN_ID_STORAGE = 'shorum.chain';

export function setChain(id: number) {
    chainId = id;
    try {
        localStorage.setItem(CHAIN_ID_STORAGE, JSON.stringify(id));
        // eslint-disable-next-line no-empty
    } catch (e) {}
}

export function getChain(): number {
    try {
        return JSON.parse(localStorage.getItem(CHAIN_ID_STORAGE));
        // eslint-disable-next-line no-empty
    } catch (e) {}
    return chainId;
}
