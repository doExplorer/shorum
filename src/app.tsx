import 'core-js';
import 'antd/dist/antd.dark.less';
import './style.less';
import './app.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { UseWalletProvider } from 'use-wallet';
import config from 'config';
import { Web3ContextProvider } from './context/Web3Context';
import reportWebVitals from './reportWebVitals';

import router from './router';

const App = (
    <UseWalletProvider
        connectors={{
            injected: {
                chainId: config.supportChains,
            },
        }}>
        <Web3ContextProvider>{router}</Web3ContextProvider>
    </UseWalletProvider>
);
ReactDOM.render(App, document.getElementById('app'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
