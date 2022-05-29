import React from 'react';
import PropTypes from 'prop-types';
import { Route, Router, Switch as RouterSwitch, Redirect, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { observer } from 'mobx-react';
import utils from 'utils';

import Theme from 'components/Theme/index';
import Page from 'components/Page/index';
import ModuleWrapper from 'components/ModuleWrapper/index';

import enUS from 'antd/lib/locale/en_US';
import { ConfigProvider } from 'antd';
import hashHistory from './js/hash-history';

// import Swap from './modules/Swap';
import Landing from './modules/Landing';
import Create from './modules/Create';
import Invite from './modules/Invite';
import Room from './modules/Room';

@observer
class Main extends React.Component<RouteComponentProps> {
    static childContextTypes = {
        // 获取当前页面的地址
        location: PropTypes.object,
    };

    getChildContext(): {} {
        return {
            // 获取当前页面的地址
            location: this.props.location,
        };
    }

    render(): React.ReactNode {
        const { location } = this.props;
        const module = `module${location.pathname.replace(/\//g, '-')}`;

        return (
            <ConfigProvider locale={enUS}>
                <Theme color={utils.getChainTheme()}>
                    <div className="layout-responsive-left-fixed page-container">
                        <div className="page-content">
                            <div className={`page-body ${module}`}>
                                <Page>
                                    <ModuleWrapper>
                                        <RouterSwitch>
                                            <Route component={Landing} path="/landing" />
                                            <Route component={Create} path="/create" />
                                            <Route component={Invite} path="/invite/:profileId" />
                                            <Route component={Room} path="/room/:id?" />
                                            {/* <Route path="/swap" component={Swap} /> */}
                                            <Redirect to="/landing" />
                                        </RouterSwitch>
                                    </ModuleWrapper>
                                </Page>
                            </div>
                        </div>
                    </div>
                </Theme>
            </ConfigProvider>
        );
    }
}

const MainWithRouter = withRouter(Main);

export default (
    <Router history={hashHistory}>
        <MainWithRouter />
    </Router>
);
