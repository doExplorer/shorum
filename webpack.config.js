const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ThemeColorWebpackPlugin = require('theme-color-webpack-plugin');
const DevServer = require('webpack-dev-server');

const port = process.env.npm_package_config_port;
const target = `${process.cwd()}/dist`;
const REACT_APP_CHAIN_ENV = 'mumbai';
const SERVER_PREFIX = 'https://shorum.herokuapp.com';

const ROOT_PATH = require('path').resolve(process.cwd());

const localIPPromise = DevServer.getHostname('local-ip');

module.exports = function (env, args = {}) {
    const mode = args.mode;
    const isAnalyzer = env.analyzer;
    const host = env.host || 'local-ip';

    return new Promise((resolve, reject) => {
        localIPPromise.then(
            (localIP) => {
                const alias = require(path.join(ROOT_PATH, 'webpack.alias.js'));

                const lessOptions = {
                    math: 'always',
                    plugins: [
                        new LessPluginAutoPrefix({
                            browsers: ['last 2 versions', '> 1%'],
                        }),
                    ],
                    modifyVars: {
                        'primary-color': '#000000',
                    },
                    javascriptEnabled: true,
                };

                let config = {
                    mode: mode,
                    entry: {},
                    stats: isAnalyzer ? 'normal' : 'errors-warnings',
                    output: {
                        path: target,
                        filename: '[name].[contenthash:8].js',
                    },
                    module: {
                        // 暂时关闭 Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
                        unknownContextCritical: false,
                        rules: [
                            {
                                test: /\.tsx?$/,
                                loader: 'babel-loader',
                                options: {
                                    extends: 'babel-config-pandora',
                                    presets: ['@babel/preset-typescript'],
                                    plugins: [['@babel/plugin-transform-typescript', { allowNamespaces: true }]],
                                },
                                include: [path.resolve(ROOT_PATH, 'src')],
                            },
                            {
                                test: /\.jsx?$/,
                                use: {
                                    loader: 'babel-loader',
                                },
                                include: [path.resolve(ROOT_PATH, 'src')],
                            },
                            {
                                test: /\.css/,
                                use: [MiniCssExtractPlugin.loader, 'css-loader'],
                            },
                            {
                                test: /\.less/,
                                use: [
                                    MiniCssExtractPlugin.loader,
                                    'css-loader',
                                    {
                                        loader: 'less-loader',
                                        options: {
                                            sourceMap: false,
                                            lessOptions,
                                        },
                                    },
                                ],
                            },
                            {
                                test: /\.(png|gif|jpg|svg|woff|ttf|otf)$/,
                                type: 'asset/inline',
                            },
                        ],
                    },
                    optimization: {
                        runtimeChunk: {
                            name: 'manifest',
                        },
                        splitChunks: {
                            chunks: 'async',
                            minSize: 30000,
                            minChunks: 1,
                            maxAsyncRequests: 5,
                            maxInitialRequests: 3,
                            name: false,
                            cacheGroups: {
                                vendor: {
                                    name: 'vendor-async',
                                    chunks: 'initial',
                                    priority: -10,
                                    reuseExistingChunk: false,
                                    test: /node_modules\/(.*)\.js[x]?/,
                                },
                            },
                        },
                    },
                    resolve: {
                        alias: typeof alias === 'function' ? alias(mode) : alias,
                        extensions: ['.ts', '.tsx', '.js', '.jsx'],
                        fallback: {
                            assert: require.resolve('assert'),
                            buffer: require.resolve('buffer'),
                            // console: require.resolve('console-browserify'),
                            // constants: require.resolve('constants-browserify'),
                            crypto: require.resolve('crypto-browserify'),
                            // domain: require.resolve('domain-browser'),
                            // events: require.resolve('events'),
                            http: require.resolve('stream-http'),
                            https: require.resolve('https-browserify'),
                            os: require.resolve('os-browserify/browser'),
                            // path: require.resolve('path-browserify'),
                            // punycode: require.resolve('punycode'),
                            // process: require.resolve('process/browser'),
                            // querystring: require.resolve('querystring-es3'),
                            stream: require.resolve('stream-browserify'),
                            // string_decoder: require.resolve('string_decoder'),
                            // sys: require.resolve('util'),
                            // timers: require.resolve('timers-browserify'),
                            // tty: require.resolve('tty-browserify'),
                            url: require.resolve('url'),
                            // util: require.resolve('util'),
                            // vm: require.resolve('vm-browserify'),
                            // zlib: require.resolve('browserify-zlib'),
                        },
                    },
                    plugins: [
                        new webpack.DefinePlugin({
                            'process.env': {
                                NODE_ENV: JSON.stringify(mode),
                                REACT_APP_CHAIN_ENV: JSON.stringify(REACT_APP_CHAIN_ENV),
                                SERVER_PREFIX: JSON.stringify(SERVER_PREFIX),
                            },
                        }),
                        new webpack.ProvidePlugin({
                            Buffer: ['buffer', 'Buffer'],
                        }),
                        new webpack.ProvidePlugin({
                            // Make a global `process` variable that points to the `process` package,
                            // because the `util` package expects there to be a global variable named `process`.
                                 // Thanks to https://stackoverflow.com/a/65018686/14239942
                            process: 'process/browser'
                         }),
                        new CaseSensitivePathsPlugin(),
                        new webpack.ids.HashedModuleIdsPlugin(),
                        new MiniCssExtractPlugin({
                            filename: '[name].[contenthash:8].css',
                            chunkFilename: '[id].[contenthash:8].css',
                            ignoreOrder: true,
                        }),
                        // new webpack.SourceMapDevToolPlugin(),
                        new ForkTsCheckerWebpackPlugin({
                            // 将 async 设为 false，可以阻止 Webpack 的 emit 以等待类型检查器/linter，并向 Webpack 的编译添加错误。
                            async: false,
                        }),
                        // 将 TypeScript 类型检查错误以弹框提示
                        // 如果 fork-ts-checker-webpack-plugin 的 async 为 false 时可以不用
                        // 否则建议使用，以方便发现错误
                        new ForkTsCheckerNotifierWebpackPlugin({
                            title: 'TypeScript',
                            excludeWarnings: true,
                            skipSuccessful: true,
                        }),
                        new ThemeColorWebpackPlugin({
                            stylesDir: path.join(__dirname, './src'), // styles directory containing all less files
                            varFile: path.join(__dirname, './src/css/variable.less'), // include all color variables in `varFile` that you want to change dynamically
                            themeVariables: ['@theme-color'], // (Optional) Specify variables to use (If not set, all variables in varFile will be used)
                            outputFilePath: path.join(__dirname, './public/color.less'), // if provided, file will be created with generated less/styles
                            include: ['./**/*.less'], // (Optional) Specify the included file
                            options: lessOptions, // (Optional) less options
                        }),
                        new CleanWebpackPlugin(),
                    ],
                };

                switch (mode) {
                    case 'production':
                        config = merge(config, {
                            optimization: {
                                minimize: true,
                                minimizer: [
                                    new TerserPlugin({
                                        terserOptions: {
                                            format: {
                                                comments: false,
                                            },
                                        },
                                        extractComments: false,
                                    }),
                                    new CssMinimizerPlugin(),
                                ],
                            },
                        });
                        break;

                    case 'development':
                        const serverProxy = {
                            // '/api/*': {
                            //     // target: `http://localhost:${Number(port) + 1}`,
                            //     target: 'https://shorum.herokuapp.com',
                            //     secure: false,
                            //     changeOrigin: true,
                            // },
                        };
                        const pages = require(path.resolve(ROOT_PATH, 'pages.js'));
                        let targetIP = localIP;
                        if (!['local-ip', 'local-ipv4', 'local-ipv6'].includes(host)) {
                            targetIP = 'localhost';
                        }
                        pages.forEach(function (page) {
                            Object.assign(serverProxy, {
                                [page.url]: {
                                    target: `http://${targetIP}:${port}`,
                                    pathRewrite: { $: '.html' },
                                },
                            });
                        });

                        config = merge(config, {
                            devtool: 'source-map',
                            devServer: {
                                host,
                                port,
                                proxy: serverProxy,
                                hot: true,
                                compress: true, //启用 gzip 压缩
                                open: [pages.length > 0 ? pages[0].url : true],
                                headers: {
                                    'X-Frame-Options': 'SAMEORIGIN',
                                    'X-XSS-Protection': '1; mode=block',
                                },
                            },
                        });
                        break;
                }

                function addEntries() {
                    let pages = require(path.resolve(ROOT_PATH, 'pages.js'));
                    pages.forEach(function (page) {
                        config.entry[page.name] = [path.resolve(ROOT_PATH, page.path)];
                        let plugin = new HtmlWebpackPlugin({
                            filename: `${page.name}.html`,
                            template: `${ROOT_PATH}/template.ejs`,
                            chunks: ['manifest', 'vendor-async', page.name],
                            favicon: `src/favicon.ico`,
                            name: page.name,
                            title: page.title,
                            banner: {
                                date: new Date().toLocaleString(),
                            },
                            scriptLoading: 'blocking',
                            minify: {
                                collapseWhitespace: true,
                                keepClosingSlash: true,
                                // 不移除 HTML 内注释
                                removeComments: false,
                                removeRedundantAttributes: true,
                                removeScriptTypeAttributes: true,
                                removeStyleLinkTypeAttributes: true,
                                useShortDoctype: true,
                            },
                        });
                        config.plugins.push(plugin);
                    });
                }
                addEntries();

                resolve(config);
            },
            (e) => {
                reject(e);
            }
        );
    });
};
