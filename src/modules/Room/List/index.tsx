import React from 'react';
import { observer } from 'mobx-react';
import Card from 'components/Card';

import './style.less';

import store from '../store';

const List = observer(function () {
    return (
        <div className="nft-list">
            {Array.from(store.nfts, (item, index) => {
                return (
                    <div key={index} className="nft-show-item">
                        <Card
                            className="nft-card"
                            imageUrl={item.imageUrl}
                            onClick={() => {
                                store.handleNftClick(item);
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
});

export default List;
