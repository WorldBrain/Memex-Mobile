const path = require('path')
const { getDefaultConfig } = require('metro-config')

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig()

    return {
        watchFolders: [path.join(__dirname, 'external')],
        resolver: {
            assetExts: assetExts.filter(ext => ext !== 'svg'),
            sourceExts: [...sourceExts, 'svg'],
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
