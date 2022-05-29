import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers, utils as ethersUtils } from 'ethers';
import RSS3, { utils as RSS3Utils } from 'rss3';
import utils from 'utils';
import AsyncLock from 'async-lock';
import mitt from 'mitt';
import config from './config';
import Events from './events';

const emitter = mitt();

export interface RSS3DetailPersona {
    file: RSS3Index | null;
    address: string;
    name: string;
    profile: RSS3Profile | null;
    followers: string[];
    following: string[];
    isReady: boolean;
}

export interface RSS3SDKPersona {
    persona: RSS3;
}

export type RSS3FullPersona = RSS3SDKPersona & RSS3DetailPersona;

export const EMPTY_RSS3_DP: RSS3DetailPersona = {
    file: null,
    address: '',
    name: '',
    profile: null,
    followers: [],
    following: [],
    isReady: false,
};
export type IRSS3 = RSS3;
const RSS3PageOwner: RSS3DetailPersona = Object.create(EMPTY_RSS3_DP);
let RSS3LoginUser: RSS3FullPersona = Object.create(EMPTY_RSS3_DP);
const RSS3APIUser: RSS3SDKPersona = {
    persona: new RSS3({
        endpoint: config.hubEndpoint,
    }),
};
let walletConnectProvider: WalletConnectProvider;
let ethersProvider: ethers.providers.Web3Provider | null;
const lock = new AsyncLock();
const isSettingPageOwner: boolean = false;

const KeyNames = {
    ConnectMethod: 'CONNECT_METHOD',
    ConnectAddress: 'CONNECT_ADDRESS',
    MetaMask: 'MetaMask',
    WalletConnect: 'WalletConnect',
};

function apiPersona(): RSS3 {
    return RSS3APIUser.persona;
}

function isValidRSS3() {
    return !!RSS3LoginUser.persona;
}

async function initUser(user: RSS3DetailPersona | RSS3FullPersona, skipSignSync: boolean = false) {
    const RSS3APIPersona = apiPersona();
    user.isReady = false;
    await lock.acquire('InitializingUser', async () => {
        // if ('persona' in user && !user.address) {
        //     // Fix address
        //     user.address = user.persona.account.address;
        // }
        // if (user.name && !user.address) {
        //     user.address = await rns.name2Addr(user.name);
        // }
        // console.log(user.file, user.name)
        // todo: save page owner into state management system
        //  (SDK getList will trigger get file, which produces one more request
        //  and make pre-inject meta useless, or just delay the follow list loading ?)
        const [followers, following, file, name] = await Promise.all([
            RSS3APIPersona.backlinks.getList(user.address, 'following'),
            RSS3APIPersona.links.getList(user.address, 'following'),
            user.file ?? RSS3APIPersona.files.get(user.address),
            user.name,
            // || rns.addr2Name(user.address),
        ]);
        // await new Promise((r) => {}); // lock process for debug
        user.followers = followers;
        user.following = following;
        user.file = file as RSS3Index;
        user.name = name;
        if ('persona' in user && user.file) {
            // Sync persona
            user.persona.files.set(user.file);
            if (!skipSignSync) {
                await user.persona.files.sync();
            }
        }
        user.profile = user.file?.profile || {};
        user.isReady = true;
    });
}

async function wcConn(skipSignSync: boolean = false) {
    // WalletConnect Connect
    walletConnectProvider = new WalletConnectProvider(config.walletConnectOptions);

    //  Enable session (triggers QR Code modal)
    let session;
    try {
        session = await walletConnectProvider.enable();
        // eslint-disable-next-line no-empty
    } catch (e) {}
    if (!session) {
        return null;
    }

    ethersProvider = new ethers.providers.Web3Provider(walletConnectProvider);

    if (!ethersProvider) {
        return null;
    }

    // Subscribe to session disconnection
    walletConnectProvider.on('disconnect', (code: number, reason: string) => {
        console.log(code, reason);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        disconnect();
    });

    let address = utils.getCrossDomainStorage(KeyNames.ConnectAddress);
    if (!address) {
        address = await ethersProvider.getSigner().getAddress();
    }

    RSS3LoginUser.persona = new RSS3({
        endpoint: config.hubEndpoint,
        address,
        agentSign: true,
        sign: async (data: string) => {
            alert('Ready to sign... You may need to prepare your wallet.');
            return (
                (await ethersProvider?.send('personal_sign', [
                    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)),
                    address.toLowerCase(),
                ])) || ''
            );
        },
    });
    await initUser(RSS3LoginUser, skipSignSync);

    return RSS3LoginUser;
}

async function mmConn(skipSignSync: boolean = false) {
    // MetaMask Connect
    if (!(window as any).ethereum) {
        return null;
    }

    const metamaskEthereum = (window as any).ethereum;
    ethersProvider = new ethers.providers.Web3Provider(metamaskEthereum);

    let address = utils.getCrossDomainStorage(KeyNames.ConnectAddress);
    if (!address) {
        const accounts = await metamaskEthereum.request({
            method: 'eth_requestAccounts',
        });
        address = ethers.utils.getAddress(accounts[0]);
    }

    RSS3LoginUser.persona = new RSS3({
        endpoint: config.hubEndpoint,
        address,
        agentSign: true,
        sign: async (data: string) => (await ethersProvider?.getSigner().signMessage(data)) || '',
    });
    await initUser(RSS3LoginUser, skipSignSync);

    return RSS3LoginUser;
}

function saveConnect(method: string) {
    if (isValidRSS3()) {
        utils.setCrossDomainStorage(KeyNames.ConnectMethod, method);
        utils.setCrossDomainStorage(KeyNames.ConnectAddress, RSS3LoginUser.address);
    }
}

async function disconnect() {
    RSS3LoginUser = Object.create(EMPTY_RSS3_DP);
    ethersProvider = null;
    if (walletConnectProvider) {
        await walletConnectProvider.disconnect();
    }
    utils.setCrossDomainStorage(KeyNames.ConnectMethod, '');
    utils.setCrossDomainStorage(KeyNames.ConnectAddress, '');
}

async function reconnect() {
    if (isValidRSS3()) {
        return true;
    }
    const lastConnect = utils.getCrossDomainStorage(KeyNames.ConnectMethod);
    const address = utils.getCrossDomainStorage(KeyNames.ConnectAddress);
    if (address) {
        switch (lastConnect) {
            case KeyNames.WalletConnect:
                ethersProvider = null;
                RSS3LoginUser.persona = new RSS3({
                    endpoint: config.hubEndpoint,
                    address,
                    agentSign: true,
                    sign: async (data: string) => {
                        if (!ethersProvider) {
                            walletConnectProvider = new WalletConnectProvider(config.walletConnectOptions);
                            let session;
                            try {
                                session = await walletConnectProvider.enable();
                                // eslint-disable-next-line no-empty
                            } catch (e) {}
                            if (!session) {
                                return '';
                            }
                            ethersProvider = new ethers.providers.Web3Provider(walletConnectProvider);
                            if (!ethersProvider) {
                                return '';
                            }
                            walletConnectProvider.on('disconnect', (code: number, reason: string) => {
                                console.log(code, reason);
                                disconnect();
                            });
                        }
                        alert('Ready to sign... You may need to prepare your wallet.');
                        return (
                            (await ethersProvider?.send('personal_sign', [
                                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)),
                                address.toLowerCase(),
                            ])) || ''
                        );
                    },
                });
                break;
            case KeyNames.MetaMask:
                ethersProvider = null;
                RSS3LoginUser.persona = new RSS3({
                    endpoint: config.hubEndpoint,
                    address,
                    agentSign: true,
                    sign: async (data: string) => {
                        if (!ethersProvider) {
                            const metamaskEthereum = (window as any).ethereum;
                            ethersProvider = new ethers.providers.Web3Provider(metamaskEthereum);
                            await metamaskEthereum.request({
                                method: 'eth_requestAccounts',
                            });
                        }
                        return (await ethersProvider?.getSigner().signMessage(data)) || '';
                    },
                });
                break;
            default:
                break;
        }
        await initUser(RSS3LoginUser, true);
    } else if (!isValidRSS3()) {
        switch (lastConnect) {
            case KeyNames.WalletConnect:
                await wcConn(true);
                break;
            case KeyNames.MetaMask:
                await mmConn(true);
                break;
            default: // logout
                utils.setCrossDomainStorage(KeyNames.ConnectMethod, '');
                break;
        }
        return isValidRSS3();
    }
    return true;
}

function dispatchEvent(event: string, detail: any) {
    // using mitt because of the performance issues caused by custom DOM events
    // refer to https://github.com/developit/mitt/issues/153
    emitter.emit(event, detail);
    console.log(event, detail);
}

async function ensureLoginUser() {
    return new Promise((resolve, reject) => {
        if (!isValidRSS3()) {
            reject(new Error('Not logged in'));
        } else {
            if (RSS3LoginUser.isReady) {
                resolve(RSS3LoginUser);
            } else {
                emitter.on(Events.connect, () => {
                    resolve(RSS3LoginUser);
                });
            }
        }
    });
}

const RSS3Instance = {
    connect: {
        walletConnect: async () => {
            if (await wcConn()) {
                saveConnect(KeyNames.WalletConnect);
                dispatchEvent(Events.connect, RSS3LoginUser);
                return RSS3LoginUser;
            }
            return null;
        },
        metamask: async () => {
            if (await mmConn()) {
                saveConnect(KeyNames.MetaMask);
                dispatchEvent(Events.connect, RSS3LoginUser);
                return RSS3LoginUser;
            }
            return null;
        },
    },
    disconnect: async () => {
        await disconnect();
        dispatchEvent(Events.disconnect, RSS3LoginUser);
    },
    reconnect: async () => {
        let res = false;
        await lock.acquire('reconnect', async () => {
            res = await reconnect();
            if (res) {
                dispatchEvent(Events.connect, RSS3LoginUser);
            }
        });
        return res;
    },
    getAPIUser: (): RSS3SDKPersona => {
        return {
            persona: apiPersona(),
        };
    },
    getLoginUser: () => {
        return RSS3LoginUser;
    },
    ensureLoginUser,
    reloadLoginUser: async () => {
        RSS3LoginUser.file = (await apiPersona().files.get(RSS3LoginUser.address, true)) as RSS3Index;
        RSS3LoginUser.profile = RSS3LoginUser.file.profile || {};
        dispatchEvent(Events.connect, RSS3LoginUser);
        return RSS3LoginUser;
    },
    isValidRSS3,

    addNewMetamaskAccount: async (): Promise<RSS3Account> => {
        // js don't support multiple return values,
        // so here I'm using signature as a message provider

        if (!isValidRSS3()) {
            return {
                id: '',
                signature: 'Not logged in',
            };
        }
        const metamaskEthereum = (window as any).ethereum;
        ethersProvider = new ethers.providers.Web3Provider(metamaskEthereum);
        try {
            const accounts = await metamaskEthereum.request({
                method: 'eth_requestAccounts',
            });
            const address = ethers.utils.getAddress(accounts[0]);

            // ${platform}-${identity}
            const newAccount = {
                id: `EVM+-${address}`,
            };
            const sigMessage = await (<RSS3>RSS3LoginUser.persona).profile.accounts.getSigMessage(newAccount);
            const signature = await ethersProvider?.getSigner().signMessage(sigMessage);
            return {
                ...newAccount,
                signature,
            };
        } catch (e: any) {
            console.log(e);
            return {
                id: '',
                signature: e.message,
            };
        }
    },
    getProfileList: async (addresses: string[]) => {
        const RSS3APIPersona = RSS3Instance.getAPIUser();
        if (!addresses || !addresses.length) {
            return [];
        }
        const profileList = await RSS3APIPersona.persona.profile.getList(addresses);
        // const profileList = [await RSS3APIPersona.persona.profile.get('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944')];
        return profileList;
    },
    getFollowingList: async (addresses: string) => {
        const RSS3APIPersona = RSS3Instance.getAPIUser();
        // const profileList = await RSS3APIPersona.profile.getList(addresses);
        const followingList = await RSS3APIPersona.persona.links.getList(addresses, 'following');
        const followingProfileList = await RSS3Instance.getProfileList(followingList);
        return followingProfileList;
    },
    getFollowerList: async (addresses: string) => {
        const RSS3APIPersona = RSS3Instance.getAPIUser();
        const followingList = await RSS3APIPersona.persona.backlinks.getList(addresses, 'following');
        const followingProfileList = await RSS3Instance.getProfileList(followingList);
        return followingProfileList;
    },
};

export default RSS3Instance;
