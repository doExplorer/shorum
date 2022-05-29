import React from 'react';
import classNames from 'classnames';
import { Select, message } from 'antd';
import Web3Utils from 'web3-utils';
import _ from 'lodash';
import config from 'config';
import hashHistory from 'hash-history';
import utils from 'utils';

const { Option } = Select;

interface SearchInputProps {
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

interface IOption {
    value: string;
    text: string;
}

interface SearchInputState {
    data: IOption[];
    value: string;
}

class SearchInput extends React.Component<SearchInputProps, SearchInputState> {
    constructor(props: SearchInputProps) {
        super(props);
        this.state = {
            data: [],
            value: undefined,
        };
    }

    handleSearch = (value: string) => {
        const trimValue = _.trim(value);
        if (Web3Utils.isAddress(trimValue, utils.getChain())) {
            const data: IOption[] = [
                {
                    value: trimValue,
                    text: trimValue,
                },
            ];
            this.setState({ data });
        } else {
            this.setState({ data: [] });
        }
    };

    handleChange = (value: string) => {
        hashHistory.push(`/room/${value}`);
        this.setState({ value: '' });
    };

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const { value } = e.target as HTMLInputElement;
            const trimValue = _.trim(value);
            if (Web3Utils.isAddress(trimValue, config.chainId)) {
                hashHistory.push(`/room/${value}`);
                this.setState({ value: '' });
            } else {
                message.error('Invalid address!');
            }
        }
    };

    render() {
        const { placeholder, className, style } = this.props;
        const options = this.state.data.map((d) => <Option key={d.value}>{d.text}</Option>);
        return (
            <Select
                showSearch
                className={classNames('search-input', className)}
                value={this.state.value}
                placeholder={placeholder}
                style={style}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={this.handleSearch}
                onChange={this.handleChange}
                notFoundContent={null}
                onInputKeyDown={this.handleKeyDown}
                size="large">
                {options}
            </Select>
        );
    }
}

export default SearchInput;
