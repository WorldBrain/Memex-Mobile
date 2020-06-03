const path = require('path')
const { getDefaultConfig } = require('metro-config')

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig()

    return {
        watchFolders: [path.join(__dirname, 'external')],
        resolver: {
            assetExts: [...assetExts.filter(ext => ext !== 'svg'), 'txt'],
            sourceExts: [...sourceExts, 'svg', 'txt'],
            extraNodeModules: {
                dist: path.resolve(__dirname + '/dist'),
            },
        },
        transformer: {
            babelTransformerPath: require.resolve(
                'react-native-svg-transformer',
            ),
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: false,
                },
            }),
        },
    }
})()
