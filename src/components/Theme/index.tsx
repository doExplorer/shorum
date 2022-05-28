import React from 'react';
import _ from 'lodash';
import utils from 'utils';
import less from 'theme-color-switch';
// eslint-disable-next-line import/no-webpack-loader-syntax
import colorSource from '!raw-loader!../../../public/color.less';

function getThemeColor() {
    return utils.getChainTheme();
}

function addCSS(cssText: string, id: string): void {
    let style = document.getElementById(id) as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.type = 'text/css';
        style.setAttribute('id', id);
        style.innerHTML = cssText;
        document.head.appendChild(style);
    }
    style.innerHTML = cssText;
}

function renderLessSourcesToCss(source: string, themeColor: string, id: string): void {
    if (!source) {
        return;
    }

    const modifyVars: { [x: string]: string } = {};

    modifyVars['@theme-color'] = themeColor;

    less.render(
        source,
        {
            modifyVars,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function (e: any, output?: { css: string }): void {
            if (e) {
                console.error('Theme color switch error: ', e);
            }
            if (output && output.css) {
                addCSS(output.css, id);
            }
        }
    );
}

function renderLessSourcesWithThemeColor(sources: string | string[], themeColor: string): void {
    // 添加组件库中的主题色样式
    renderLessSourcesToCss(colorSource, themeColor, 'less:theme:color');

    if (typeof sources === 'string') {
        sources = [sources];
    } else {
        sources = _.toArray(sources);
    }
    sources = sources.join('\n');
    // 添加项目中的主题色样式
    renderLessSourcesToCss(sources, themeColor, 'less:theme:color:extra');
}

const ThemeContext = React.createContext({
    themeColor: getThemeColor(),
});

export interface ThemeProps {
    /**
     * 主题色，选填。可以传入颜色值字符串
     */
    color?: string;
    /** 主题色相关less内容 */
    lessSource?: string | string[];
    children: React.ReactNode;
}

interface ThemeState {
    color?: string;
}

class Theme extends React.PureComponent<ThemeProps, ThemeState> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static Consumer: React.Consumer<any>;

    constructor(props: ThemeProps) {
        super(props);
        const color = props.color || getThemeColor();
        this.state = {
            color,
        };
        this._changeThemeColor(color, props.lessSource);
    }

    componentDidUpdate(prevProps: Readonly<ThemeProps>, prevState: Readonly<ThemeState>): void {
        if (prevProps.color !== this.props.color) {
            this.changeThemeColor(this.props.color);
        }
    }

    changeThemeColor = (color: string): void => {
        this._changeThemeColor(color, this.props.lessSource);
        this.setState({ color });
    };

    _changeThemeColor = (color: string, sources: string | string[]): void => {
        renderLessSourcesWithThemeColor(sources, color);
    };

    render(): React.ReactNode {
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        const value = {
            themeColor: this.state.color,
            changeThemeColor: this.changeThemeColor,
        };
        return <ThemeContext.Provider value={value}>{this.props.children}</ThemeContext.Provider>;
    }
}

Theme.Consumer = ThemeContext.Consumer;

export default Theme;
