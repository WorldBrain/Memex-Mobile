import path from 'path'

import initLoaderRules from './loaders'
import initPlugins from './plugins'
import initMinimizers from './minimizers'
// import { externalTsModules } from './external'

export const extensions = ['.ts', '.tsx', '.js', '.jsx', '.coffee']

export const entry = {
    content_script_reader: './src/content-script/index.ts',
}

export const output = {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
}

export default ({ context = __dirname, mode = 'development', ...opts }) => {
    const aliases = {
        src: path.resolve(context, './src'),
    }

    // for (const [moduleAlias, modulePath] of Object.entries(externalTsModules)) {
    //     const extPath = path.resolve(context, `./external/${modulePath}/ts`)
    //     Object.assign(aliases, {
    //         [`${moduleAlias}$`]: extPath,
    //         [`${moduleAlias}/lib`]: extPath,
    //     })
    // }

    const conf = {
        context,
        entry,
        output,
        mode,
        devtool:
            mode === 'development'
                ? 'inline-cheap-module-source-map'
                : 'hidden-source-map',
        plugins: initPlugins({
            ...opts,
            mode,
        }),
        module: {
            rules: initLoaderRules({ ...opts, mode, context }),
        },
        resolve: {
            extensions,
            symlinks: false,
            mainFields: ['browser', 'main', 'module'],
            alias: aliases,
        },
        stats: {
            assetsSort: 'size',
            children: false,
            cached: false,
            cachedAssets: false,
            entrypoints: false,
            excludeAssets: /\.(png|svg)/,
            maxModules: 5,
        },
        performance: {
            hints: false,
        },
    }

    if (mode === 'production') {
        conf.optimization = {
            minimizer: initMinimizers(),
        }
    }

    return conf
}
